interface EventEmitter {
    on(ename: string, cbk: ()=>void): void;
}