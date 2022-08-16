import {panic} from '@enre/logging';
import {python as enrePython} from './enre';
import {
  cpp as understandCpp,
  java as understandJava,
  python as understandPython,
  ts as understandTs,
} from './understand';
import {usingNewFormatProfile} from '@enre/naming';
import {FormatProfile} from '@enre/naming/lib/format-profiles';

export default function (lang: string, tool: string) {
  switch (tool) {
    case 'depends':
      switch (lang) {
        case 'cpp':
        case 'java':
        case 'python':
        default:
          panic(`Cannot test ${tool} on ${lang}`);
      }
      break;

    case 'enre1':
      switch (lang) {
        case 'cpp':
        case 'java':
        case 'python':
          return enrePython;
        default:
          panic(`Cannot test ${tool} on ${lang}`);
      }
      break;

    case 'sourcetrail':
      switch (lang) {
        case 'cpp':
        case 'java':
        case 'python':
        default:
          panic(`Cannot test ${tool} on ${lang}`);
      }
      break;

    case 'understand':
      usingNewFormatProfile(FormatProfile.understand);

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
          panic(`Cannot test ${tool} on ${lang}`);
      }
  }
}
