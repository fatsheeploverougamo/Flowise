type EventHandler = (...args: any[]) => void

interface EventBus {
    on(event: string, handler: EventHandler): void
    off(event: string, handler: EventHandler): void
    emit(event: string, ...args: any[]): void
}

class EventBusImpl implements EventBus {
    private events: Map<string, Set<EventHandler>>

    constructor() {
        this.events = new Map()
    }

    /**
     * 注册事件监听器
     * @param event 事件名称
     * @param handler 事件处理函数
     */
    on(event: string, handler: EventHandler): void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set())
        }
        this.events.get(event)!.add(handler)
    }

    /**
     * 移除事件监听器
     * @param event 事件名称
     * @param handler 事件处理函数
     */
    off(event: string, handler: EventHandler): void {
        const handlers = this.events.get(event)
        if (handlers) {
            handlers.delete(handler)
            if (handlers.size === 0) {
                this.events.delete(event)
            }
        }
    }

    /**
     * 触发事件
     * @param event 事件名称
     * @param args 传递给事件处理函数的参数
     */
    emit(event: string, ...args: any[]): void {
        const handlers = this.events.get(event)
        if (handlers) {
            handlers.forEach((handler) => {
                try {
                    handler(...args)
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error)
                }
            })
        }
    }

    /**
     * 移除所有事件监听器
     * @param event 可选，指定要清除的事件名称。如果不指定，则清除所有事件
     */
    clear(event?: string): void {
        if (event) {
            this.events.delete(event)
        } else {
            this.events.clear()
        }
    }

    /**
     * 只监听一次事件，触发后自动移除
     * @param event 事件名称
     * @param handler 事件处理函数
     */
    once(event: string, handler: EventHandler): void {
        const onceHandler = (...args: any[]) => {
            handler(...args)
            this.off(event, onceHandler)
        }
        this.on(event, onceHandler)
    }
}

// 创建单例实例
const eventBus = new EventBusImpl()

// 导出单例实例
export default eventBus

// 导出类型定义
export type { EventBus, EventHandler }
