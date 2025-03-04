export function logExecutionTime(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
        const start = performance.now();
        const result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
            // 如果是异步函数，等待 Promise 完成
            return result.then((res) => {
                const end = performance.now();
                console.log(`${propertyKey} executed in ${(end - start).toFixed(2)}ms`);
                return res;
            });
        } else {
            // 如果是同步函数，直接记录时间
            const end = performance.now();
            console.log(`${propertyKey} executed in ${(end - start).toFixed(2)}ms`);
            return result;
        }
    };
    return descriptor;
}