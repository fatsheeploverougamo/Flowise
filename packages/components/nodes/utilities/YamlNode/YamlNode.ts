import { ICommonObject, INode, INodeData, INodeOutputsValue, INodeParams, INodeOptionsValue } from '../../../src/Interface'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import os from 'os'

class YamlNode_Utilities implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    tags: string[]
    inputs: INodeParams[]
    outputs: INodeOutputsValue[]

    constructor() {
        this.label = 'Yaml Node'
        this.name = 'yamlNode'
        this.version = 1.0
        this.type = 'YamlNode'
        this.icon = 'yamlnode.svg'
        this.category = 'Utilities'
        this.description = 'yaml node'
        this.baseClasses = [this.type, 'Utilities']
        this.tags = ['Utilities']
        this.inputs = [
            {
                label: 'Input Value',
                name: 'inputValue',
                type: 'string | number | json | array | file',
                description: 'Input value for condition check (can be any type of data)',
                placeholder: 'Enter value or connect to other nodes',
                acceptVariable: true,
                optional: true
            }
        ]
        this.outputs = [
            {
                label: 'Result',
                name: 'result',
                baseClasses: ['string', 'number', 'boolean', 'json', 'array', 'any'],
                description: 'Result of the arithmetic operation'
            }
        ]
    }

    //@ts-ignore
    loadMethods = {
        async listLoopInputNodes(_: INodeData, options: ICommonObject): Promise<INodeOptionsValue[]> {
            const returnOptions: INodeOptionsValue[] = []

            try {
                console.log('DEBUG - Options received:', options)
                const nodes = options.nodes || []
                console.log(
                    'DEBUG - Available nodes:',
                    nodes?.map((node: ICommonObject) => ({
                        id: node.id,
                        type: node.data?.type,
                        name: node.data?.name,
                        label: node.data?.label
                    }))
                )

                if (nodes && nodes.length > 0) {
                    for (const node of nodes) {
                        // 检查所有可能的标识符
                        if (node.data?.type === 'LoopInput' || node.data?.name === 'loopInput' || node.type === 'LoopInput') {
                            console.log('DEBUG - Found LoopInput node:', node.id)
                            returnOptions.push({
                                label: `${node.data?.label || 'Loop Input'} (${node.id})`,
                                name: node.id,
                                description: node.data?.label || 'Loop Input Node'
                            })
                        }
                    }
                }
            } catch (error) {
                console.error('Error in listLoopInputNodes:', error)
            }

            console.log('DEBUG - Return options:', returnOptions)
            return returnOptions
        }
    }

    async init(nodeData: INodeData, input: string, options: ICommonObject = {}): Promise<any> {
        const { inputParams } = nodeData
        const { filePath } = inputParams as { filePath: string }

        if (!path.isAbsolute(filePath)) {
            throw new Error('filePath 必须为绝对路径！')
        }

        // 写入临时 JSON 文件
        const tempFilePath = path.join(os.tmpdir(), `inputParams_${Date.now()}.json`)
        fs.writeFileSync(tempFilePath, JSON.stringify(inputParams), 'utf-8')

        const args = [tempFilePath]

        return new Promise((resolve, reject) => {
            const child = spawn(filePath, args, {
                shell: true,
                windowsHide: true,
                timeout: 10000
            })

            let stdout = ''
            let stderr = ''

            child.stdout.on('data', (data) => {
                stdout += data.toString()
            })

            child.stderr.on('data', (data) => {
                stderr += data.toString()
            })

            child.on('error', (err) => {
                // 删除临时文件
                fs.unlinkSync(tempFilePath)
                reject(new Error(`程序启动失败: ${err.message}`))
            })

            child.on('close', (code) => {
                // 删除临时文件
                fs.unlinkSync(tempFilePath)

                if (code === 0) {
                    try {
                        resolve({ result: JSON.parse(stdout) })
                    } catch {
                        resolve({ result: stdout })
                    }
                } else {
                    reject(new Error(`程序异常退出，code=${code}，stderr=${stderr}`))
                }
            })
        })
    }
}

module.exports = { nodeClass: YamlNode_Utilities }
