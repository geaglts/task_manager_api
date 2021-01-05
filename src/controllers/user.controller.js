const User = require("../models/user");

module.exports = {
    async getMany(req, res) {
        try {
            const users = await User.find();
            res.send(users);
        } catch (error) {
            res.status(500).send(error);
        }
    },
    async getOne(req, res) {
        try {
            const _id = req.params.id;
            const user = await User.findById(_id);
            if (!user) {
                return res.status(404).send();
            }
            res.send(user);
        } catch (error) {
            res.status(500).send(error);
        }
    },
    async createOne(req, res) {
        try {
            const newUser = new User(req.body);
            const userExist = await User.findOne({ email: newUser.email });
            if (userExist) {
                throw new Error("User exists");
            }

            const token = await newUser.generateAuthToken();
            await newUser.save();

            res.status(201).send({ newUser, token });
        } catch (error) {
            res.status(400).send();
        }
    },
    async updateOne(req, res) {
        const updates = Object.keys(req.body);
        const allowedUpdates = ["name", "email", "password"];
        const isValidOperation = updates.every((update) =>
            allowedUpdates.includes(update)
        );

        if (!isValidOperation) {
            return res.status(400).send({ error: "Invalid updates!" });
        }

        try {
            updates.forEach((update) => (req.user[update] = req.body[update]));
            await req.user.save();

            res.send(req.user);
        } catch (error) {
            res.send(500).send(error);
        }
    },
    async deleteOne(req, res) {
        try {
            await req.user.remove();
            res.send(req.user);
        } catch (error) {
            res.send(500).send();
        }
    },
    async login(req, res) {
        try {
            const user = await User.findByCredentials(
                req.body.email,
                req.body.password
            );

            const token = await user.generateAuthToken();

            res.send({ user, token });
        } catch (error) {
            res.status(400).send();
        }
    },
    async logout(req, res) {
        try {
            req.user.tokens = req.user.tokens.filter(
                (token) => token.token !== req.token
            );
            await req.user.save();
            res.send("Bye.");
        } catch (error) {
            res.status(500).send();
        }
    },
    async logoutAll(req, res) {
        try {
            req.user.tokens = [];
            await req.user.save();
            res.send();
        } catch (error) {
            res.status(500).send();
        }
    },
    me(req, res) {
        try {
            res.send(req.user);
        } catch (error) {
            res.status(400).send();
        }
    },
};
