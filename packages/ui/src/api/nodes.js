import client from './client'

const getAllNodes = () => client.get('/nodes')

const getSpecificNode = (name) => client.get(`/nodes/${name}`)
const getNodesByCategory = (name) => client.get(`/nodes/category/${name}`)

const executeCustomFunctionNode = (body) => client.post(`/node-custom-function`, body)

const uploadYaml = (formData) =>
    client.post('/nodes/upload-yaml', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })

const deleteYaml = (nodeNames) =>
    client.delete('/nodes/delete-yaml', {
        data: { nodeNames }
    })

export default {
    getAllNodes,
    getSpecificNode,
    getNodesByCategory,
    executeCustomFunctionNode,
    uploadYaml,
    deleteYaml
}
