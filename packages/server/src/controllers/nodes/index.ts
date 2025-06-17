import { Request, Response, NextFunction } from 'express'
import _ from 'lodash'
import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'
import nodesService from '../../services/nodes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'
import { getUserHome } from '../../utils'

const getAllNodes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const apiResponse = await nodesService.getAllNodes()
        const yamlNodes = await getNodeByYaml(next)

        // 确保apiResponse是数组
        const apiResponseArray = Array.isArray(apiResponse) ? apiResponse : []
        const yamlNodesArray = Array.isArray(yamlNodes) ? yamlNodes : []

        // 将yaml节点合并到apiResponse中
        const combinedResponse = [...apiResponseArray, ...yamlNodesArray]

        return res.json(combinedResponse)
    } catch (error) {
        next(error)
    }
}

const getNodeByName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.name) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, `Error: nodesController.getNodeByName - name not provided!`)
        }
        const apiResponse = await nodesService.getNodeByName(req.params.name)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getNodesByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params.name === 'undefined' || req.params.name === '') {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: nodesController.getNodesByCategory - name not provided!`
            )
        }
        const name = _.unescape(req.params.name)
        const apiResponse = await nodesService.getAllNodesForCategory(name)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getSingleNodeIcon = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.name) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, `Error: nodesController.getSingleNodeIcon - name not provided!`)
        }
        const apiResponse = await nodesService.getSingleNodeIcon(req.params.name)
        return res.sendFile(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getSingleNodeAsyncOptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: nodesController.getSingleNodeAsyncOptions - body not provided!`
            )
        }
        if (typeof req.params === 'undefined' || !req.params.name) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: nodesController.getSingleNodeAsyncOptions - name not provided!`
            )
        }
        const apiResponse = await nodesService.getSingleNodeAsyncOptions(req.params.name, req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const executeCustomFunction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: nodesController.executeCustomFunction - body not provided!`
            )
        }
        const apiResponse = await nodesService.executeCustomFunction(req.body)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getNodeByYaml = async (next: NextFunction) => {
    try {
        // 使用配置或环境变量来定义 yaml 存储路径
        const yamlDir = process.env.YAML_DIR || path.join(process.env.DATA_DIR || getUserHome(), '.flowise', 'yaml')

        const nodes = []
        // 检查yaml文件夹是否存在
        if (!fs.existsSync(yamlDir)) {
            fs.mkdirSync(yamlDir, { recursive: true })
            return []
        }

        // 读取yaml文件夹中的所有文件
        const files = fs.readdirSync(yamlDir)

        for (const file of files) {
            const filePath = path.normalize(path.join(yamlDir, file))
            const stats = fs.statSync(filePath)

            // 只处理文件，不处理文件夹
            if (!stats.isFile()) continue

            // 检查是否为yaml文件
            const ext = path.extname(file).toLowerCase()
            if (ext !== '.yaml' && ext !== '.yml') continue

            try {
                // 读取yaml文件内容
                const yamlContent = fs.readFileSync(filePath, 'utf8')

                // 将yaml转换为json
                const jsonData = yaml.load(yamlContent)

                // 生成文件名（首字母大写）
                const fileName = path.basename(file, ext)
                const label = fileName.replace(/_([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, (s) => s.toUpperCase())

                // 创建节点配置
                const nodeConfig = {
                    label: label,
                    name: 'yamlNode',
                    version: 1,
                    type: 'YamlNode',
                    yamlType: true,
                    icon: path.normalize(
                        'D:/workfiles/Flowise/packages/server/node_modules/flowise-components/dist/nodes/yamlNodes/yaml.svg'
                    ),
                    category: 'Utilities',
                    description: `yaml node for ${fileName}`,
                    baseClasses: ['YamlNode', 'Utilities'],
                    tags: ['Utilities'],
                    inputs: [
                        {
                            label: 'Input Value',
                            name: 'inputValue',
                            type: 'string | number | json | array | file',
                            description: 'Input value for exe',
                            acceptVariable: true,
                            inputsHidden: true
                        }
                    ],
                    outputs: [
                        {
                            baseClasses: ['number', 'string', 'json', 'array', 'file'],
                            label: 'Output Value',
                            name: 'outputValue'
                        }
                    ],
                    outputsHidden: true,
                    inputParams: jsonData,
                    filePath: path.normalize(
                        'D:\\workfiles\\Flowise\\packages\\server\\node_modules\\flowise-components\\dist\\nodes\\utilities\\YamlNode\\YamlNode.js'
                    )
                }

                nodes.push(nodeConfig)
            } catch (error) {
                console.error(`Error processing yaml file ${file}:`, error)
                // 继续处理其他文件，不中断整个流程
            }
        }

        return nodes
    } catch (error) {
        next(error)
    }
}

// 上传yaml文件接口
const uploadYaml = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '未选择文件' })
        }
        const file = req.file
        const ext = file.originalname.split('.').pop()?.toLowerCase()
        if (ext !== 'yaml' && ext !== 'yml') {
            return res.status(400).json({ message: '请上传yaml格式文件' })
        }
        // 使用配置或环境变量来定义 yaml 存储路径
        const yamlDir = process.env.YAML_DIR || path.join(process.env.DATA_DIR || getUserHome(), '.flowise', 'yaml')

        // 确保目录存在
        if (!fs.existsSync(yamlDir)) {
            fs.mkdirSync(yamlDir, { recursive: true })
        }

        // 检查重名
        const filePath = path.normalize(path.join(yamlDir, file.originalname))
        if (fs.existsSync(filePath)) {
            return res.status(400).json({ message: 'yaml文件夹内已存在同名文件' })
        }
        // 写入文件
        fs.writeFileSync(filePath, file.buffer)
        return res.json({ message: '上传成功', status: 200, data: { filePath } })
    } catch (error) {
        next(error)
    }
}

// 删除yaml文件接口
const deleteYaml = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { nodeNames } = req.body
        if (!nodeNames || !Array.isArray(nodeNames) || nodeNames.length === 0) {
            return res.status(400).json({ message: '节点名称不能为空' })
        }

        // 使用配置或环境变量来定义 yaml 存储路径
        const yamlDir = process.env.YAML_DIR || path.join(process.env.DATA_DIR || getUserHome(), '.flowise', 'yaml')

        // 确保目录存在
        if (!fs.existsSync(yamlDir)) {
            fs.mkdirSync(yamlDir, { recursive: true })
        }

        // 获取目录中的所有文件
        const existingFiles = fs.readdirSync(yamlDir)

        interface DeleteResult {
            success: string[]
            failed: Array<{ name: string; reason: string }>
        }

        const results: DeleteResult = {
            success: [],
            failed: []
        }

        // 删除每个文件
        for (const nodeName of nodeNames) {
            // 将驼峰命名转换为下划线命名
            const snakeCase = nodeName.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`).replace(/^_/, '')
            const fileName = snakeCase + '.yaml'
            const filePath = path.normalize(path.join(yamlDir, fileName))

            try {
                // 检查文件是否存在
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                    results.success.push(nodeName)
                } else {
                    // 检查是否存在其他大小写版本的文件
                    const matchingFile = existingFiles.find(
                        (file) =>
                            file.toLowerCase() === fileName.toLowerCase() ||
                            file.toLowerCase() === nodeName.toLowerCase() + '.yaml' ||
                            file.toLowerCase() === nodeName.toLowerCase() + '.yml'
                    )

                    if (matchingFile) {
                        const actualPath = path.normalize(path.join(yamlDir, matchingFile))
                        fs.unlinkSync(actualPath)
                        results.success.push(nodeName)
                    } else {
                        results.failed.push({
                            name: nodeName,
                            reason: `文件不存在 (尝试路径: ${filePath}, 已检查: ${existingFiles.join(', ')})`
                        })
                    }
                }
            } catch (error: any) {
                results.failed.push({ name: nodeName, reason: `删除失败: ${error.message || '未知错误'}` })
            }
        }

        // 返回删除结果
        if (results.failed.length === 0) {
            return res.json({
                message: `成功删除 ${results.success.length} 个文件`,
                status: 200,
                data: results
            })
        } else {
            return res.json({
                message: `成功删除 ${results.success.length} 个文件，${results.failed.length} 个文件删除失败`,
                status: 207,
                data: results
            })
        }
    } catch (error: any) {
        next(error)
    }
}

export default {
    getAllNodes,
    getNodeByName,
    getSingleNodeIcon,
    getSingleNodeAsyncOptions,
    executeCustomFunction,
    getNodesByCategory,
    uploadYaml,
    deleteYaml
}
