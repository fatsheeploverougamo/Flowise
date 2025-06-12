import { Box, FormControl } from '@mui/material'
import PropTypes from 'prop-types'
import { useRef, useEffect } from 'react'
import EventBus from '@/eventBus'

const QWidget = (props) => {
    const { label, children, childrenRenderFunction, style, className, onClick, layout } = props
    const isRow = layout === 'QHBoxLayout'

    //获取子节点ref
    const childrenRefs = useRef([])

    //监听setFile事件
    useEffect(() => {
        EventBus.on('setFile', (data) => {
            console.log(data)
        })

        return () => {
            EventBus.off('setFile')
        }
    }, [])

    //如果label是Texture File，则返回一个FormControl
    if (label === `Texture File`) {
        return (
            <FormControl>
                <Box
                    className={className}
                    sx={{
                        display: 'flex',
                        flexDirection: isRow ? 'row' : 'column',
                        padding: '8px',
                        ...style
                    }}
                    onClick={onClick}
                >
                    {childrenRenderFunction.map((childRenderFunction, index) => {
                        return (
                            <div style={{ marginRight: isRow ? '12px' : '0px' }} key={`child_${index}`}>
                                {childRenderFunction({ childrenRefs, index, isTextureFile: true })}
                            </div>
                        )
                    })}
                </Box>
            </FormControl>
        )
    }
    return (
        <Box
            className={className}
            sx={{
                display: 'flex',
                flexDirection: isRow ? 'row' : 'column',
                padding: '8px',
                ...style
            }}
            onClick={onClick}
        >
            {children.map((child, index) => {
                return (
                    <div style={{ marginRight: isRow ? '12px' : '0px' }} key={`child_${index}`}>
                        {child}
                    </div>
                )
            })}
        </Box>
    )
}

QWidget.propTypes = {
    label: PropTypes.string,
    children: PropTypes.node,
    childrenRenderFunction: PropTypes.array,
    style: PropTypes.object,
    className: PropTypes.string,
    onClick: PropTypes.func,
    layout: PropTypes.string
}

export default QWidget
