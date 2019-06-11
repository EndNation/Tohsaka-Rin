/**
* Akashic Records (False): Automaton
*/
const fs = require('fs');
const d3 = require('d3-dsv');

const FIELDS = [
  'id',
  'name',
  'className',
  'rarity',
  'growth',
  'lv',
  'hps',
  'atks',
  'npGains',
  'hitCounts',
  'crits',
  'death',
  'attr',
  'traits',
  'actives',
  'passives',
  'np',
  'deck',
  'ascs',
  'upgrades',
  'avail',
  'cost',
  'align',
  'bondId',
  'art',
  'voice',
  'valId'
];
const ENCODING = 'utf8';
const DELIM = '\\';
const ARGS = process.argv.slice(2);
const dsv = d3.dsvFormat(DELIM);
const db = {};

if (ARGS.length !== 3) {
  throw new Error('Arguments: svt_file skill_file dst_json');
}

db.servants = dsv.parse(
  FIELDS.join(DELIM) + '\n' + fs.readFileSync(ARGS[0], {encoding: ENCODING}),
  svt => {
    for (const field of FIELDS) {
      svt[field] = svt[field].trim();
      if (field.endsWith('s')) {
        if (svt[field].includes(';')) {
          svt[field] = svt[field].split(/ *; */).filter(e => e && e !== '-');
        } else {
          svt[field] = svt[field].split(/ *, */).filter(e => e && e !== '-');
        }
      }
    }

    return svt;
  }
);

db.actives = dsv.parseRows(
  fs.readFileSync(ARGS[1], {encoding: ENCODING}),
  row => {
    if (row[2].trim() !== 'Skill') {
      return null;
    }

    const skill = {
      id: row[0].trim(),
      effects: []
    };

    if (row[1].trim() !== '-') {
      skill.id += ' ' + row[1].trim();
    }

    for (let i = 6; i < row.length; i++) {
      const details = row[i].trim().split(/ *;; */);
      let summary = details[0];
      if (summary === '-') {
        continue;
      }

      if (details.length > 1 && details[details.length - 1].length !== 0) {
        summary += ` <<${details[details.length - 1]}>>`;
      }

      skill.effects.push(summary);
    }

    return skill;
  }
);

db.passives = dsv.parseRows(
  fs.readFileSync(ARGS[1], {encoding: ENCODING}),
  row => {
    if (row[2].trim() !== 'Passive') {
      return null;
    }

    const skill = {
      id: row[0].trim(),
      effects: row[3].trim().split(/ *, */)
    };

    if (row[1].trim() !== '-') {
      skill.id += ' ' + row[1].trim();
    }

    return skill;
  }
);

db.nps = dsv.parseRows(
  fs.readFileSync(ARGS[1], {encoding: ENCODING}),
  row => {
    if (row[2].trim() !== 'Noble') {
      return null;
    }

    const skill = {
      id: row[1].trim(),
      name: row[0].trim() + ' ' + row[4].trim(),
      alias: row[3].trim(),
      effects: []
    };

    for (let i = 8; i < row.length; i++) {
      const details = row[i].trim().split(/ *;; */);
      let summary = details[0];
      if (summary === '-') {
        continue;
      }

      if (details.length > 1 && details[details.length - 1].length !== 0) {
        summary += ` <<${details[details.length - 1]}>>`;
      }

      skill.effects.push(summary);
    }

    return skill;
  }
);

fs.writeFileSync(ARGS[2], JSON.stringify(db), {encoding: ENCODING});
