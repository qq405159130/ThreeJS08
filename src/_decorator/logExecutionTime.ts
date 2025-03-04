let globalCounter = 0; // 全局计数器
const startTime = performance.now(); // 程序启动时间

export function logExecutionTime(title?: string) {
    return function (
        target: any, // 目标类或原型
        propertyKey: string, // 方法名
        descriptor: PropertyDescriptor // 属性描述符
    ) {
        const originalMethod = descriptor.value; // 原始方法
        if (typeof originalMethod === 'function') {
            descriptor.value = function (...args: any[]) {
                const methodStartTime = performance.now();
                const result = originalMethod.apply(this, args); // 调用原始方法
                const logTitle = title || "Method"; // 如果未传递 title，使用默认值 "Method"

                if (result instanceof Promise) {
                    // 如果是异步函数，等待 Promise 完成
                    return result.then((res) => {
                        const methodEndTime = performance.now();
                        const elapsedTime = (methodEndTime - startTime) / 1000; // 计算从启动到当前的时间差（秒）
                        console.log(
                            `[${globalCounter++}] [第${elapsedTime.toFixed(3)}秒] ${logTitle} - ${propertyKey} executed in ${(methodEndTime - methodStartTime).toFixed(2)}ms`
                        );
                        return res;
                    });
                } else {
                    // 如果是同步函数，直接记录时间
                    const methodEndTime = performance.now();
                    const elapsedTime = (methodEndTime - startTime) / 1000; // 计算从启动到当前的时间差（秒）
                    console.log(
                        `[${globalCounter++}] [第${elapsedTime.toFixed(3)}秒] ${logTitle} - ${propertyKey} executed in ${(methodEndTime - methodStartTime).toFixed(2)}ms`
                    );
                    return result;
                }
            };
        }
        return descriptor; // 返回修改后的属性描述符
    };
}