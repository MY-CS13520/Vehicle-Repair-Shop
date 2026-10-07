require('dotenv').config()

const connectDB = require('../config/db')
const User = require('../models/User')
const Branch = require('../models/Branch')
const ServiceType = require('../models/ServiceType')

async function seed(){
    try{
        await connectDB()

        await User.deleteMany(
            {
                email: {
                    $in: [
                        'admin@seed.local',
                        'manager@seed.local',
                        'staff@seed.local',
                        'customer@seed.local',
                    ],
                },
            }
        )
        await Branch.deleteMany({
            name: { $in: ['Seed Colombo Branch', 'Seed Kandy Branch'] },
        })
        await ServiceType.deleteMany({
            name: { $in: ['Seed Oil Change', 'Seed Brake Service']},
        })
        await Branch.deleteMany({
            name: { $regex: /^Seed / },
          })

        const colombo = await Branch.create({
            name: 'Seed Colombo Branch',
            region: 'Western',
            address: { city: 'Colombo', street: '1 Seed Street'},
            contact: { phone: '0111111111', email: 'colombo@seed.local'},
            isActive: true,
        })

        const kandy = await Branch.create({
            name: 'Seed Kandy Branch',
            region: 'Central',
            address: { city: 'Kandy', street: '2 Seed Street'},
            contact: { phone: '0811111111', email: 'kandy@seed.local'},
            isActive: true,
        })

        const admin = await User.create({
            email: 'admin@seed.local',
            passwordHash: 'SEED_HASH_ONLY_NOT_REAL',
            name: 'Seed Super Admin',
            role: 'SuperAdmin',
        })

        const manager = await User.create({
            email: 'manager@seed.local',
            passwordHash: 'SEED_HASH_ONLY_NOT_REAL',
            name: 'Seed Branch Manager',
            role: 'BranchManager',
            branch: colombo._id,
        })

        const staff = await User.create({
            email: 'staff@seed.local',
            passwordHash: 'SEED_HASH_ONLY_NOT_REAL',
            name: 'Seed Staff',
            role: 'Staff',
            branch: colombo._id,
        })

        const customer = await User.create({
            email: 'customer@seed.local',
            passwordHash: 'SEED_HASH_ONLY_NOT_REAL',
            name: 'Seed Customer',
            role: 'Customer',
        })

        const services = await ServiceType.insertMany([
            {
            name: 'Seed Oil Change',
            description: 'Seed iol change service',
            basePrice: 5000,
            estimatedDurationMinutes: 60,
            isActive: true,
        },
        {
            name: 'Seed Brake Service',
            description: 'Seed brake service',
            basePrice: 8000,
            estimatedDurationMinutes: 90,
            isActive: true,
        },
        ])

        console.log('Seed complete:')
        console.log({
            branches: 2,
            users: 4,
            serviceTypes: services.length,
            emails: [
                admin.email,
                manager.email,
                staff.email,
                customer.email,
            ],
            regions: [colombo.region, kandy.region],
        })

        const userCount = await User.countDocuments({
            email: { $regex: /@seed\.local$/ },
        })
        const branchCount = await Branch.countDocuments({
            name: { $regex: /^Seed/ },
        })
        const serviceCount = await ServiceType.countDocuments({
            name: { $regex: /^Seed / },
        })

        console.log('Counts:', {userCount, branchCount, serviceCount})
        console.log('Expected: users=4, branches=2, services=2')

        process.exit(0)

    }catch(error){
        console.error('Seed failed:', error.message)
        process.exit(1)
    }
} 

seed()