import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
    Dialog,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Button,
    IconButton,
    Stack
} from '@mui/material'
import { IconX } from '@tabler/icons-react'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { useDispatch } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'

const YamlNodesDialog = ({ show, dialogProps, onCancel, onUpload, onDelete, yamlNodes }) => {
    const [selectedNodes, setSelectedNodes] = useState([])
    const dispatch = useDispatch()
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))
    // 重置选择状态
    useEffect(() => {
        if (!show) {
            setSelectedNodes([])
        }
    }, [show])

    // 处理文件选择
    const handleFileSelect = (event) => {
        const file = event.target.files[0]
        if (!file) return

        // 校验扩展名
        const ext = file.name.split('.').pop().toLowerCase()
        if (ext !== 'yaml' && ext !== 'yml') {
            enqueueSnackbar({
                message: '请选择yaml格式文件',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error'
                }
            })
            return
        }

        // 检查是否存在同名文件
        if (yamlNodes.some((node) => node.label + '.yaml' === file.name)) {
            enqueueSnackbar({
                message: 'yaml文件夹内已存在同名文件',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error'
                }
            })
            return
        }

        onUpload(file)
    }

    // 触发文件选择
    const triggerFileSelect = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.yaml,.yml'
        input.onchange = handleFileSelect
        input.click()
    }

    // 处理节点选择
    const handleNodeSelect = (nodeName) => {
        setSelectedNodes((prev) => {
            if (prev.includes(nodeName)) {
                return prev.filter((name) => name !== nodeName)
            } else {
                return [...prev, nodeName]
            }
        })
    }

    // 处理全选
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedNodes(yamlNodes.map((node) => node.label))
        } else {
            setSelectedNodes([])
        }
    }

    return (
        <Dialog open={show} onClose={onCancel} fullWidth maxWidth='sm' aria-labelledby='yaml-nodes-dialog-title'>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography variant='h3'>编辑 YAML 节点</Typography>
                <IconButton onClick={onCancel} size='small'>
                    <IconX />
                </IconButton>
            </Box>
            <DialogContent>
                <Stack spacing={2}>
                    <FormGroup>
                        {yamlNodes.map((node) => (
                            <FormControlLabel
                                key={node.label}
                                control={
                                    <Checkbox checked={selectedNodes.includes(node.label)} onChange={() => handleNodeSelect(node.label)} />
                                }
                                label={node.label + '.yaml'}
                            />
                        ))}
                    </FormGroup>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, justifyContent: 'flex-start' }}>
                <Button
                    onClick={() =>
                        onDelete(selectedNodes, () => {
                            setSelectedNodes([])
                        })
                    }
                    color='error'
                    variant='contained'
                    disabled={selectedNodes.length === 0 || yamlNodes.length === 0}
                >
                    删除节点 ({selectedNodes.length})
                </Button>
                <StyledButton variant='contained' onClick={triggerFileSelect}>
                    上传节点
                </StyledButton>
            </DialogActions>
        </Dialog>
    )
}

YamlNodesDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onCancel: PropTypes.func,
    onUpload: PropTypes.func,
    onDelete: PropTypes.func,
    yamlNodes: PropTypes.array
}

export default YamlNodesDialog
