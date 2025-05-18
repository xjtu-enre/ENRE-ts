import {eGraph, release, rGraph} from '@enre-ts/data';
import {expandENRELocation} from '@enre-ts/location';
import fs from 'node:fs/promises';
import {createLogger} from '@enre-ts/shared';
import { ClassHierarchyAnalyzer as CHAnalyzer } from '@enre-ts/core/lib/analyzer/callgraph/ClassHierarchyAnalysisAlgorithm';
import { RapidTypeAnalyzer as RTAnalyzer} from '@enre-ts/core/lib/analyzer/callgraph/RapidTypeAnalysisAlgorithm';
import { PointerAnalyzer as PTAnalyzer } from '@enre-ts/core/lib/analyzer/callgraph/PointerAnalysis';
const logger = createLogger('JSON dumper');

const ignorePropList = [
  'children',
  'pointsTo',
  'arguments',
  'exports',
  'imports',
  'declarations',
  'alias',
  'ofRelation',
  'logs',
  'getQualifiedName',
  'getSourceFile',
  'pkgJson',
  'thisPointsTo',
  'base',
  'extcls',
  'isValidThis',
  'typeID',
  'typeRepr'
];

export default function (opts: any) {
  release();

  // ENRE-JSON output format
  const obj = {entities: [] as any[], relations: [] as any[]};

  for (const e of eGraph.all) {
    const tmp = {} as any;
    for (const prop of Object.getOwnPropertyNames(e)) {
      tmp['fullname'] = e.getQualifiedName();
      if (prop === 'name') {
        tmp[prop] = e.name.string;
      } else if (prop === 'location') {
        tmp[prop] = expandENRELocation(e);
      } else if (ignorePropList.includes(prop)) {
        // Ignore
      } else if (['sourceFile', 'parent'].indexOf(prop) !== -1) {
        tmp[prop] = (e as any)[prop]?.id;
      } else {
        tmp[prop] = (e as any)[prop];
      }
    }
    obj.entities.push(tmp);
  }

  nextRelation: for (const r of rGraph.all) {
    const tmp = {} as any;
    for (const prop of Object.getOwnPropertyNames(r)) {
      if (['from', 'to'].indexOf(prop) !== -1) {
        // Implicit dependency resolving bug, at this end we have to ignore it.
        if ((r as any)[prop] === undefined) {
          continue nextRelation;
        }
        tmp[prop] = (r as any)[prop].id;
      } else if (prop === 'location') {
        tmp[prop] = {
          line: r.location.start.line,
          column: r.location.start.column,
        };
      } else if (ignorePropList.includes(prop)) {
        /* Ignore */
      } else {
        tmp[prop] = (r as any)[prop];
      }
    }
    obj.relations.push(tmp);
  }
  const seen = new WeakSet();
  const stringify = JSON.stringify(obj,function replacer(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
          return;  // 移除循环引用的属性
      }
      seen.add(value);
  }
    // 过滤掉 'base' 和 'extcls' 属性
    if (ignorePropList.includes(key)) {
        return undefined;
    }
    if (key === 'typeName' && value.length === 0){
      return undefined;
    }
    if (key === 'returnType' && value.length === 0){
      return undefined;
    }
    if (key === 'typeName'){
      value = [...new Set(value)];
    }
    return value;
  }, '\t');
  fs.writeFile(opts.output, stringify);
  // CHAnalyzer.dumpToJson(opts.callgraph)
  //fs.writeFile(opts.callgraph, CHAnalyzer.dumpToJson());
  //fs.writeFile(opts.RTA, RTAnalyzer.dumpToJson())
  if (opts.PTA){
    // fs.writeFile(opts.PTA, PTAnalyzer.dumpToJson())
    // fs.writeFile(opts.PTA, PTAnalyzer.dumpTaskToJson())
    const callGraphJson = JSON.parse(PTAnalyzer.dumpToJson());
    const callGraphWithTaskJson = JSON.parse(PTAnalyzer.dumpTaskToJson());

    const merged = {
      callGraph: callGraphJson,
      callGraphWithTask: callGraphWithTaskJson
    };

    fs.writeFile(opts.PTA, JSON.stringify(merged, null, 2), 'utf-8');
  }
  //console.log(...RTAnalyzer.newClass)
  // fs.writeFile(opts.callgraph, CHAnalyzer.jsonString);
  logger.info(`Results dumped to ${opts.output} in JSON format with ${obj.entities.length} entities and ${obj.relations.length} dependencies`);
}
