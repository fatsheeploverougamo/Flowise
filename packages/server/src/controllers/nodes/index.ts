import { Request, Response, NextFunction } from 'express'
import _ from 'lodash'
import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'
import nodesService from '../../services/nodes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'

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
        const yamlDir = path.join(__dirname, '../../../../../yaml')
        const nodes = []
        // 检查yaml文件夹是否存在
        if (!fs.existsSync(yamlDir)) {
            return []
        }

        // 读取yaml文件夹中的所有文件
        const files = fs.readdirSync(yamlDir)

        for (const file of files) {
            const filePath = path.join(yamlDir, file)
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
                    // "name": fileName,
                    version: 1,
                    type: 'YamlNode',
                    icon: 'D:/workfiles/Flowise/packages/server/node_modules/flowise-components/dist/nodes/yamlNodes/yaml.svg',
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
                    filePath:
                        'D:\\workfiles\\Flowise\\packages\\server\\node_modules\\flowise-components\\dist\\nodes\\utilities\\YamlNode\\YamlNode.js'
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

export default {
    getAllNodes,
    getNodeByName,
    getSingleNodeIcon,
    getSingleNodeAsyncOptions,
    executeCustomFunction,
    getNodesByCategory
}
