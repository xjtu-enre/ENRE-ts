import loadData from './load-data.js';

// MODIFY THIS
const DEP_DIR = '';
const SCRIPT_PATH = '';
const WITH_GET_PREFIX = true;

// DO NOT MODIFY AFTER
const allData = await loadData(DEP_DIR);
const pp = (await import(SCRIPT_PATH)).default;
console.log(pp.process(...pp.dependencies.map(dep => allData[WITH_GET_PREFIX ? `get-${dep}` : dep])));
