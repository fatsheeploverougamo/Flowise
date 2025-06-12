import PropTypes from 'prop-types'
import { Button } from '@mui/material'
import { forwardRef, useImperativeHandle } from 'react'
import EventBus from '@/eventBus'

const QPushButton = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
        onClick: () => {
            console.log('onClick')
        }
    }))

    const {
        onClick,
        variant = 'contained',
        color = 'primary',
        disabled = false,
        size = 'medium',
        fullWidth = false,
        text = 'Submit',
        childrenRefsInfo = {}
    } = props

    const { isTextureFile } = childrenRefsInfo

    let onClickValue = onClick

    if (isTextureFile) {
        onClickValue = () => {
            EventBus.emit('getFile', 'test')
        }
    }

    return (
        <Button variant={variant} color={color} onClick={onClickValue} disabled={disabled} size={size} fullWidth={fullWidth}>
            {text}
        </Button>
    )
})

QPushButton.displayName = 'QPushButton'

QPushButton.propTypes = {
    label: PropTypes.string || null || undefined,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
    color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success']),
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    fullWidth: PropTypes.bool,
    text: PropTypes.string,
    childrenRefsInfo: PropTypes.object
}

export default QPushButton
