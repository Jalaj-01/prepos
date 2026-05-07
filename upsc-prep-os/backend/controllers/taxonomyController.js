const Taxonomy = require('../models/Taxonomy');

exports.createTaxonomy = async (req, res) => {
    try {
        const { names, level, parentId } = req.body;
        // Handle both single string or array of strings
        const namesArray = Array.isArray(names) ? names : [names];

        const results = [];
        for (let name of namesArray) {
            const cleanName = name.trim();
            if (!cleanName) continue;

            const exists = await Taxonomy.findOne({ name: cleanName, level, parentId: parentId || null });
            if (!exists) {
                const entry = await Taxonomy.create({ name: cleanName, level, parentId: parentId || null });
                results.push(entry);
            }
        }
        res.status(201).json({ message: "Success", items: results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTaxonomy = async (req, res) => {
    try {
        const data = await Taxonomy.find().populate('parentId').sort({ createdAt: 1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTaxonomy = async (req, res) => {
    try {
        await Taxonomy.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};