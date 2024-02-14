const fs = require('fs').promises 
const path = require('path') 
const ipfsAPI = require('ipfs-api') 

const ipfs = ipfsAPI({ host: '127.0.0.1', port: 5001, protocol: 'http' }) 

async function makeFileObjects(ownerName, docName, validated, description, document, tokenId) {
    const obj = { ownerName, docName, validated, description, document } 
    const buffer = Buffer.from(JSON.stringify(obj)) 

    const files = [
        { path: `${tokenId}.json`, content: buffer }
    ] 
    return files 
}

async function storeFiles(files) {
    const result = await ipfs.files.add(files, { wrapWithDirectory: true }) 
    return result[0].hash 
}

const fileFromPath = async (document, fileName) => {
    const filePath = document.tempFilePath 
    const content = await fs.readFile(filePath) 
    const files = [
        { path: fileName, content }
    ] 
    return files 
} 


const ipfsUpload = async (req, res) => {
    const { ownerName, docName, validated, description, tokenId } = req.body 
    console.log(ownerName, docName, validated, description, tokenId) 

    const { document } = req?.files ?? {} 
    console.log(`Uploading document: [${docName}] to local IPFS server.`) 

    try {
        if (!document || !docName || !description || !ownerName || !validated || !tokenId || docName === undefined) {
            return res.status(400).send({ message: 'Invalid input' }) 
        }

        const documentName = `${new Date().getTime()}_${document.name.replace(/ /g, '')}` 
        const file = await fileFromPath(document, documentName) 
        const documentCid = await storeFiles(file) 

        const files = await makeFileObjects(
            ownerName,
            docName,
            validated,
            description,
            `http://localhost:8081/ipfs/${documentCid}`,
            tokenId
        ) 

        const metaDataCid = await storeFiles(files) 

        const metadataUrl = `http://localhost:8081/ipfs/${metaDataCid}` 

        const ipfsTierInfo = {
            ownerName,
            docName,
            validated,
            description,
            ipfsUrl_Metadata: metadataUrl,
            ipfsUrl_Document: `http://localhost:8081/ipfs/${documentCid}`
        } 

        res.json(ipfsTierInfo) 
    } catch (error) {
        console.log(`Problem while uploading document to local IPFS server: ${error}`) 
        return res.status(500).send({
            message: 'Problem while uploading document to local IPFS server'
        }) 
    }
}

const fileUploadPage = async (req, res) => {
    res.render('upload') 
} 

module.exports = { ipfsUpload, fileUploadPage } 