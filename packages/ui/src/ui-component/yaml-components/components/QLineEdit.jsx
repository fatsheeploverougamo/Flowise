import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import { TextField } from '@mui/material'
import PropTypes from 'prop-types'
import EventBus from '@/eventBus'

const QLineEdit = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({}))

    const {
        value,
        onChange,
        currentPath,
        properties = {},
        label,
        type = 'text',
        required = false,
        disabled = false,
        error = false,
        helperText = '',
        style,
        childrenRefsInfo = {}
    } = props

    const { isTextureFile } = childrenRefsInfo
    const fileInputRef = useRef(null)

    useEffect(() => {
        if (isTextureFile) {
            const handleGetFile = () => {
                handleFileClick()
            }
            EventBus.on('getFile', handleGetFile)

            // 清理函数
            return () => {
                EventBus.off('getFile', handleGetFile)
            }
        }
    }, [isTextureFile])

    const { placeholder = '' } = properties
    // 确保value始终有一个有效值
    const [controlledValue, setControlledValue] = useState(value === undefined ? '' : value)

    const handleChange = (event) => {
        const newValue = event.target.value
        setControlledValue(newValue)
    }

    const handleFileClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            setControlledValue(file.path || file.name) // 使用文件路径或文件名

            // 将文件转换为base64
            const reader = new FileReader()
            reader.onload = (e) => {
                const base64 = e.target.result
                onChange(currentPath, {
                    notValue: true,
                    file: base64,
                    pathName: file.path || file.name,
                    value: file.path || file.name
                })
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <>
            <TextField
                value={controlledValue}
                onChange={handleChange}
                placeholder={placeholder}
                label={label}
                type={type}
                required={required}
                disabled={disabled || isTextureFile} // 当 isTextureFile 为 true 时禁用输入
                error={error}
                helperText={helperText}
                fullWidth
                size='small'
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '4px'
                    },
                    ...style,
                    cursor: isTextureFile ? 'pointer' : 'text' // 当 isTextureFile 为 true 时显示指针光标
                }}
            />
            {isTextureFile && (
                <input
                    type='file'
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    accept='*' // 可以根据需要设置接受的文件类型
                />
            )}
        </>
    )
})

QLineEdit.displayName = 'QLineEdit'

QLineEdit.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    currentPath: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    label: PropTypes.string,
    type: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    error: PropTypes.bool,
    helperText: PropTypes.string,
    style: PropTypes.object,
    properties: PropTypes.object,
    childrenRefsInfo: PropTypes.object
}

export default QLineEdit
