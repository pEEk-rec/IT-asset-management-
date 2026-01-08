const AdminUser = require('../models/AdminUser');
const Employee = require('../models/Employee');

// Get all users (both admin and employees)
exports.getAllUsers = async (req, res) => {
    try {
        const adminUsers = await AdminUser.find();
        const employees = await Employee.find();

        const allUsers = [...adminUsers, ...employees];
        res.json(allUsers);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Server error fetching users' });
    }
};

// Get user by ID (checks both collections)
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // Try to find in AdminUser first
        let user = await AdminUser.findOne({ userId: id });

        // If not found, try Employee
        if (!user) {
            user = await Employee.findOne({ userId: id });
        }

        // If still not found, try by MongoDB _id
        if (!user) {
            user = await AdminUser.findById(id);
        }

        if (!user) {
            user = await Employee.findById(id);
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ error: 'Server error fetching user' });
    }
};

// Create new user
exports.createUser = async (req, res) => {
    try {
        const { userId, username, email, role, department, phone, position } = req.body;

        // Check if user already exists
        const existingAdmin = await AdminUser.findOne({ $or: [{ userId }, { email }] });
        const existingEmployee = await Employee.findOne({ $or: [{ userId }, { email }] });

        if (existingAdmin || existingEmployee) {
            return res.status(400).json({
                error: 'User already exists with this ID or email'
            });
        }

        let user;
        if (role === 'admin') {
            user = new AdminUser({
                userId,
                username,
                email,
                role,
                department,
                phone,
                status: 'active'
            });
        } else {
            user = new Employee({
                userId,
                username,
                email,
                role: 'employee',
                department,
                position,
                phone,
                status: 'active'
            });
        }

        await user.save();
        res.status(201).json(user);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Server error creating user' });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Try AdminUser first
        let user = await AdminUser.findOneAndUpdate(
            { userId: id },
            req.body,
            { new: true, runValidators: true }
        );

        // If not found, try Employee
        if (!user) {
            user = await Employee.findOneAndUpdate(
                { userId: id },
                req.body,
                { new: true, runValidators: true }
            );
        }

        // Try by MongoDB _id
        if (!user) {
            user = await AdminUser.findByIdAndUpdate(
                id,
                req.body,
                { new: true, runValidators: true }
            );
        }

        if (!user) {
            user = await Employee.findByIdAndUpdate(
                id,
                req.body,
                { new: true, runValidators: true }
            );
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Server error updating user' });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Try AdminUser first
        let user = await AdminUser.findOneAndDelete({ userId: id });

        // If not found, try Employee
        if (!user) {
            user = await Employee.findOneAndDelete({ userId: id });
        }

        // Try by MongoDB _id
        if (!user) {
            user = await AdminUser.findByIdAndDelete(id);
        }

        if (!user) {
            user = await Employee.findByIdAndDelete(id);
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully', user });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Server error deleting user' });
    }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;

        let users;
        if (role === 'admin') {
            users = await AdminUser.find({ role: 'admin' });
        } else if (role === 'employee') {
            users = await Employee.find();
        } else {
            return res.status(400).json({ error: 'Invalid role' });
        }

        res.json(users);
    } catch (error) {
        console.error('Get users by role error:', error);
        res.status(500).json({ error: 'Server error fetching users' });
    }
};
