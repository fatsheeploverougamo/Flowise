import express from 'express'
import nodesController from '../../controllers/nodes'
import multer from 'multer'
const upload = multer()
const router = express.Router()

// READ
router.get('/', nodesController.getAllNodes)
router.get('/:name', nodesController.getNodeByName)
router.get('/icon/:name', nodesController.getSingleNodeIcon)
router.get('/category/:name', nodesController.getNodesByCategory)
router.post('/node-custom-function', nodesController.executeCustomFunction)

// 上传yaml文件
router.post('/upload-yaml', upload.single('file'), nodesController.uploadYaml)

// 删除yaml文件
router.delete('/delete-yaml', nodesController.deleteYaml)

export default router
