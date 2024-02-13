const fs = require('fs')
const path = require('path')
require('dotenv').config()
const { Web3Storage, File } = require('web3.storage')

const web3StorageAPIKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM3MzViQTQyRjU5MGU1M0M0MzUxZEM1MTA4NTMwNGY0QTQ4ZDZGMDQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTQzNDIxODE1MTEsIm5hbWUiOiJTZWN1cmVEb2NzIn0.KKrifAdlRN-3CzNqRIX51lUMcvqQyrrtSuYfWpg2hLo'

function makeStorageClient() {
    return new Web3Storage({ token: web3StorageAPIKey }) 
}

async function makeFileObjects(ownerName, docName,validated, description, document, tokenId) {
    const obj = { ownerName,docName,validated, description, document } 
    const buffer = Buffer.from(JSON.stringify(obj))

    const files = [
        new File([buffer], `${tokenId}.json`)
    ]
    return files
}

async function storeFiles(files) {
    const client = makeStorageClient()
    const cid = await client.put(files)
    return cid
}

const fileFromPath = async (document, fileName) => {
    const filePath = document.tempFilePath 

    const content = await fs.promises.readFile(filePath)
    const files = [
        new File([content], fileName)
    ]
    return files
}


const web3StorageUpload = async (req, res) => {
    const { ownerName, docName ,validated, description,tokenId } = req.body 
    console.log(ownerName, docName ,validated, description,tokenId)
    const { document } = req?.files ?? {} 
    console.log(`Uploading document: [${docName}] to ipfs.`) 
    try {
        if (!document && !docName && !description && !ownerName&& !validated&& !tokenId|| docName === undefined) {
            return res.status(200).send({ message: 'invalid input' }) 
        }
        const documentName = `${new Date().getTime()}_${document.name.replaceAll(' ', '')}` 
        const file = await fileFromPath(document, documentName) 
        const documentCid = await storeFiles(file) 
        const files = await makeFileObjects(ownerName, docName,validated, description, `https://${documentCid}.ipfs.w3s.link/${documentName}`,tokenId) 
        const metaDataCid = await storeFiles(files) 
        await fs.promises.unlink(document.tempFilePath) 
        const metadataUrl = `https://${metaDataCid}.ipfs.w3s.link/${tokenId}.json` 

        const ipfsTierInfo = {
            ownerName, docName,validated,
            description,
            ipfsUrl_NFT_Metadata: metadataUrl
        } 
        // TODO: store metadata to db
        res.json(ipfsTierInfo)
    } catch (error) {
        console.log(`Problem while uploading document to ipfs: ${error}`) 
        return res.status(500).send({
            message: 'Problem while uploading document to ipfs'
        })
    }
}

const fileUploadPage = async(req,res)=>{
    res.render("upload")
}

module.exports ={web3StorageUpload,fileUploadPage}
