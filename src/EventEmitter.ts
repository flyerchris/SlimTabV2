interface EventEmitter {
    on(ename: string, cbk: (...args: any[])=>void): void;
}