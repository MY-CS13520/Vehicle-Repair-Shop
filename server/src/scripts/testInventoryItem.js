require('dotenv').config()

const connectDB = require('../config/db')
const Branch = require('../models/Branch')
const InventoryItem = require('../models/InventoryItem')

async function run() {
    try {
        await connectDB()
        let branchA = await Branch.findOne({ name: 'Colombo Test Branch'})
        
        if(!branchA){
            throw new Error('Colombo Test Branch missing. Run testBranch.js first.')
        }

        let branchB = await Branch.findOne({ name: 'Kandy Test Branch' })
        if(!branchB) {
            branchB = await Branch.create({
            name: 'Kandy Test Branch',
            region: 'Central',
            address: { city: 'Kandy' },
            contact: { phone: '0812345678' },
            isActive: true,
        })
        }

        await InventoryItem.deleteMany({ sku: 'OIL-5W30'})
        const itemA = await InventoryItem.create({
            sku: 'OIL-5W30',
            name: 'Engine Oil 5W-30',
            quantity: 20,
            reorderThreshold: 5,
            unitCost: 2500,
            branch: branchA._id,
        })

        const itemB = await InventoryItem.create({
            sku: 'OIL-5W30',
            name: 'Engine Oil 5W-30',
            quantity: 8,
            reorderThreshold: 5,
            unitCost: 2500,
            branch: branchB._id,
          })

          console.log('Created items for two branches')

            const onlyA = await InventoryItem.find({ branch: branchA._id, sku: 'OIL-5W30' })
            const onlyB = await InventoryItem.find({ branch: branchB._id, sku: 'OIL-5W30' })
            console.log('Branch A count:', onlyA.length, 'qty:', onlyA[0].quantity)
            console.log('Branch B count:', onlyB.length, 'qty:', onlyB[0].quantity)
            console.log('A id !== B id:', itemA._id.toString() !== itemB._id.toString())
            process.exit(0)
        } catch (error) {
            console.error('Test failed:', error.message)
            process.exit(1)
        }
    }
    run()