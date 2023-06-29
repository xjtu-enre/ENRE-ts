import {cpp as dependsCpp, java as dependsJava, python as dependsPython,} from './depends';
import {cpp as enreCpp, java as enreJava, python as enrePython, ts as enreTs} from './enre';
import {cpp as stCpp, java as stJava, python as stPython} from './sourcetrail';
import {
  cpp as understandCpp,
  java as understandJava,
  python as understandPython,
  ts as understandTs,
} from './understand';
import {logger} from '../cli';

export default function (lang: string, tool: string) {
  switch (tool) {
    case 'depends':
      switch (lang) {
        case 'cpp':
          return dependsCpp;
        case 'java':
          return dependsJava;
        case 'python':
          return dependsPython;
        default:
          logger.error(`Cannot test ${tool} on ${lang}`);
      }
      break;

    case 'enre':
      switch (lang) {
        case 'cpp':
          return enreCpp;
        case 'java':
          return enreJava;
        case 'python':
          return enrePython;
        case 'ts':
          return enreTs;
        default:
          logger.error(`Cannot test ${tool} on ${lang}`);
      }
      break;

    case 'sourcetrail':
      switch (lang) {
        case 'cpp':
          return stCpp;
        case 'java':
          return stJava;
        case 'python':
          return stPython;
        default:
          logger.error(`Cannot test ${tool} on ${lang}`);
      }
      break;

    case 'understand':
      switch (lang) {
        case 'cpp':
          return understandCpp;
        case 'java':
          return understandJava;
        case 'python':
          return understandPython;
        case 'ts':
          return understandTs;
        default:
          logger.error(`Cannot test ${tool} on ${lang}`);
      }
  }
}
