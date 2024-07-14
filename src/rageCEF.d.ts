interface Mp {
    trigger(eventName: string, ...args: unknown[]): void;
    events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        add(eventName: string, callback: (...args: any) => void);
        reset();
        remove(eventName: string);
        call(eventName: string, ...args: unknown[]): void;
    }

}

declare const mp: Mp;