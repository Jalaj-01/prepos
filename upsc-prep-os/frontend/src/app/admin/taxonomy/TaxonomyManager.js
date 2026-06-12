"use client";

import {
    useEffect,
    useState
} from "react";

import axios from "axios";

import {
    ChevronDown,
    ChevronRight,
    Plus,
    Pencil,
    Trash2,
    FolderTree
} from "lucide-react";

export default function TaxonomyManager() {

    const [
        taxonomy,
        setTaxonomy
    ] = useState([]);

    const [
        expanded,
        setExpanded
    ] = useState({});

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        newName,
        setNewName
    ] = useState("");

    const [
        selectedParent,
        setSelectedParent
    ] = useState(null);

    const [
        selectedLevel,
        setSelectedLevel
    ] = useState("subject");

    const [
        editingId,
        setEditingId
    ] = useState(null);

    const [
        editValue,
        setEditValue
    ] = useState("");

    // =========================
    // TOKEN
    // =========================

   const getAuthConfig = () => {

    const userInfo =
        JSON.parse(

            localStorage.getItem(
                "userInfo"
            )
        );

    const token =
        userInfo?.token;

    return {

        headers: {

            Authorization:
                `Bearer ${token}`
        }
    };
};

    // =========================
    // FETCH
    // =========================

    const fetchTaxonomy = async () => {

        try {

            setLoading(true);

            const response =
                await axios.get(

                    "http://localhost:5000/api/taxonomy",

                    getAuthConfig()
                );

            setTaxonomy(
                response.data
            );

        } catch (error) {

            console.error(
                "Fetch taxonomy failed",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchTaxonomy();

    }, []);

    // =========================
    // CREATE
    // =========================

    const handleCreate = async () => {

        if (!newName.trim())
            return;

        try {

            await axios.post(

                "http://localhost:5000/api/taxonomy",

                {
                    names: [newName],

                    level:
                        selectedLevel,

                    parentId:
                        selectedParent
                },

                getAuthConfig()
            );

            setNewName("");

            fetchTaxonomy();

        } catch (error) {

            console.error(
                "Create taxonomy failed",
                error
            );
        }
    };

    // =========================
    // DELETE
    // =========================

    const handleDelete =
    async (id) => {

       const confirmDelete = await confirmAction({
    title: "Delete this taxonomy item?",
    message: "All child topics and subtopics will also be removed.",
    type: "warning",
    confirmText: "Delete",
});

        if (!confirmDelete)
            return;

        try {

            await axios.delete(

                `http://localhost:5000/api/taxonomy/${id}`,

                getAuthConfig()
            );

            fetchTaxonomy();

        } catch (error) {

            console.error(
                "Delete taxonomy failed",
                error
            );
        }
    };

    // =========================
    // EDIT
    // =========================

    const handleEdit =
    async (id) => {

        if (!editValue.trim())
            return;

        try {

            await axios.put(

                `http://localhost:5000/api/taxonomy/${id}`,

                {
                    name: editValue
                },

                getAuthConfig()
            );

            setEditingId(null);

            setEditValue("");

            fetchTaxonomy();

        } catch (error) {

            console.error(
                "Update taxonomy failed",
                error
            );
        }
    };

    // =========================
    // TREE HELPERS
    // =========================

    const getChildren =
    (parentId) => {

        return taxonomy.filter(

            item =>

                String(
                    item.parentId?._id ||
                    item.parentId
                ) === String(parentId)
        );
    };

    const getRootSubjects =
    () => {

        return taxonomy.filter(

            item =>
                item.level === "subject"
        );
    };

    // =========================
    // TREE NODE
    // =========================

    const renderNode =
    (node) => {

        const children =
            getChildren(node._id);

        const isExpanded =
            expanded[node._id];

        return (

            <div
                key={node._id}
                className="ml-4 mt-3"
            >

                <div className="bg-white border border-brand-border rounded-2xl px-4 py-3 flex items-center justify-between">

                    {/* LEFT */}

                    <div className="flex items-center gap-3">

                        {
                            children.length > 0 ? (

                                <button

                                    onClick={() =>

                                        setExpanded({

                                            ...expanded,

                                            [node._id]:
                                                !isExpanded
                                        })
                                    }
                                >

                                    {
                                        isExpanded
                                            ? (
                                                <ChevronDown size={18} />
                                            )
                                            : (
                                                <ChevronRight size={18} />
                                            )
                                    }

                                </button>

                            ) : (

                                <div className="w-[18px]" />
                            )
                        }

                        <FolderTree
                            size={16}
                            className="text-brand-muted"
                        />

                        {
                            editingId === node._id ? (

                                <input

                                    value={editValue}

                                    onChange={(e) =>
                                        setEditValue(
                                            e.target.value
                                        )
                                    }

                                    className="border border-brand-border rounded-xl px-3 py-2 font-bold"
                                />

                            ) : (

                                <div>

                                    <h3 className="font-black text-brand-dark">

                                        {node.name}

                                    </h3>

                                    <p className="text-xs uppercase text-brand-muted font-bold">

                                        {node.level}

                                    </p>

                                </div>
                            )
                        }

                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-center gap-2">

                        {
                            editingId === node._id ? (

                                <button

                                    onClick={() =>
                                        handleEdit(
                                            node._id
                                        )
                                    }

                                    className="px-4 py-2 rounded-xl bg-brand-dark text-white text-sm font-bold"
                                >

                                    Save

                                </button>

                            ) : (

                                <button

                                    onClick={() => {

                                        setEditingId(
                                            node._id
                                        );

                                        setEditValue(
                                            node.name
                                        );
                                    }}

                                    className="p-2 rounded-xl border border-brand-border"
                                >

                                    <Pencil size={16} />

                                </button>
                            )
                        }

                        <button

                            onClick={() =>
                                handleDelete(
                                    node._id
                                )
                            }

                            className="p-2 rounded-xl border border-red-200 text-red-600"
                        >

                            <Trash2 size={16} />

                        </button>

                        {
                            node.level !==
                            "subtopic" && (

                                <button

                                    onClick={() => {

                                        setSelectedParent(
                                            node._id
                                        );

                                        setSelectedLevel(

                                            node.level === "subject"
                                                ? "topic"
                                                : "subtopic"
                                        );
                                    }}

                                    className="p-2 rounded-xl border border-brand-border"
                                >

                                    <Plus size={16} />

                                </button>
                            )
                        }

                    </div>

                </div>

                {/* CHILDREN */}

                {
                    isExpanded && (

                        <div className="ml-6 border-l border-dashed border-brand-border pl-4 mt-3">

                            {
                                children.map(
                                    renderNode
                                )
                            }

                        </div>
                    )
                }

            </div>
        );
    };

    return (

        <div className="min-h-screen bg-brand-light p-8">

            {/* HEADER */}

            <div className="mb-8">

                <h1 className="text-5xl font-black text-brand-dark">

                    Taxonomy Manager

                </h1>

                <p className="text-brand-muted mt-2 text-lg">

                    Manage subjects, topics,
                    and subtopics hierarchy.

                </p>

            </div>

            {/* CREATE BAR */}

            <div className="bg-white border border-brand-border rounded-[32px] p-6 mb-8 flex items-center gap-4">

                <input

                    value={newName}

                    onChange={(e) =>
                        setNewName(
                            e.target.value
                        )
                    }

                    placeholder={`Add ${selectedLevel}`}

                    className="flex-1 border border-brand-border rounded-2xl px-5 py-4 font-bold bg-brand-light"
                />

                <button

                    onClick={handleCreate}

                    className="px-6 py-4 rounded-2xl bg-brand-dark text-white font-black"
                >

                    Add

                </button>

            </div>

            {/* TREE */}

            {
                loading ? (

                    <div className="font-black uppercase tracking-widest text-brand-muted animate-pulse">

                        Loading Taxonomy...

                    </div>

                ) : (

                    <div>

                        {
                            getRootSubjects().map(
                                renderNode
                            )
                        }

                    </div>
                )
            }

        </div>
    );
}