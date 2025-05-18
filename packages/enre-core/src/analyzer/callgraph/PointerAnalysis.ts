

import { ENREEntityClass, ENREEntityCollectionAll, ENREEntityCollectionScoping } from "@enre-ts/data";
import { DescendPostponedTask} from "../visitors/common/expression-handler";
type TraceStep = {
    type: string;            // 如 "access", "call"
    symbol?: string;         // 可选，操作符前的名称，如 d 或 a
    target: string;          // 实际目标名称，如 "func2"
    location?: string;       // 仅 call 类型需要
  };
  
type Trace = {
    steps: TraceStep[];
  };
  
type CallGraphWithTask = Map<string, Trace[]>;

export class PointerAnalyzer{
    static classes: Map<string, ENREEntityClass> = new Map();
    
    static callGraph: Map<string, Set<string>> = new Map();
    static jsonString: string;
    // static callGraphWithTask: Map<string, Set<string>> = new Map();
    static callGraphWithTask: CallGraphWithTask = new Map();

    static dumpToJson(){
        // 创建一个普通对象来存储转换后的数据
        const obj: { [key: string]: string[] } = {};

        this.callGraph.forEach((value, key) => {
            obj[key] = Array.from(value);
        });
        // this.callGraphWithTask.forEach((value, key) => {
        //     obj[key] = Array.from(value);
        // });
        // 使用 2 个空格缩进来格式化 JSON 字符串
        // const jsonString = JSON.stringify(obj, null, 2); 
        this.jsonString = JSON.stringify(obj, null, '\t');
        return this.jsonString
        // return jsonString
        // fs.writeFile('out/callGraph.json', jsonString, (err) => {
        //     if (err) {
        //         console.error('Error writing file:', err);
        //     } else {
        //         console.log('File has been written');
        //     }
        // });
    }
    static dumpTaskToJson(): string {
        const result: Record<string, Trace[]> = {};
      
        for (const [from, traces] of this.callGraphWithTask.entries()) {
          result[from] = traces.map(trace => ({
            steps: trace.steps.map(step => ({
              type: step.type,
              symbol: step.symbol,
              target: step.target,
              location: step.location
            }))
          }));
        }
      
        return JSON.stringify(result, null, 2);  // 美化缩进为 2 空格
      }
    static add(from:any, to:any, location:any, task?: DescendPostponedTask){
        if (!this.callGraph.has(from)) {
            this.callGraph.set(from, new Set());
          }
        this.callGraph.get(from)?.add(to+'@'+location.start.line+':'+location.start.column);
        if (task) {
            if (!this.callGraphWithTask.has(from)) {
                this.callGraphWithTask.set(from, []);
            }
        
            const traceSteps = [];
        
            for (let i = task.payload.length - 1; i !== 0; i -= 1) {
                const payloadItem = task.payload[i];
                const step: any = {
                    type: payloadItem.operation || 'unknown',
                    target: 'Unk'
                };
        
                if ('operand1' in payloadItem && payloadItem.operand1) {
                    step.symbol = payloadItem.operand1.toString();
                }
        
                if ('lastSymbol' in payloadItem && (payloadItem as any).lastSymbol[0]) {
                    const symbol = (payloadItem as any).lastSymbol[0];
                    if (typeof symbol.getEntityName === 'function') {
                        step.target = symbol.getEntityName();
                    }
                }
        
                traceSteps.push(step);
            }
        
            // 添加最终的调用点
            traceSteps.push({
                type: "call",
                target: to,
                location: `${location.start.line}:${location.start.column}`
            });
        
            // 将结构化 trace 添加到 callGraphWithTask 中
            this.callGraphWithTask.get(from)?.push({
                steps: traceSteps
            });
        }
        // 检查 from 对应的集合中是否已包含 to
        // const fromSet = this.callGraph.get(from);
        // if (fromSet?.has(to)) {
        //     console.log(`'${from}' already has a connection to '${to}'`);
        // } else {
        //     // 如果没有，添加 to 到集合中
        //     fromSet?.add(to);
        // }
    }
    

}