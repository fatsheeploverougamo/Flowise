import { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react'

/**
 * 检查组件是否被 React.forwardRef 包裹
 * @param component React组件
 * @returns boolean
 */
export function isForwardRef<T = any, P = any>(
    component: any
): component is ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>> {
    return typeof component === 'object' && component !== null && component.$$typeof === Symbol.for('react.forward_ref')
}
