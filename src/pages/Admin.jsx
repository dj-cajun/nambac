import { useState, useEffect } from 'react';

const Admin = () => {
    // Password Protection
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const ADMIN_PASSWORD = '0922';

    // Check session storage on mount
    useEffect(() => {
        const savedAuth = sessionStorage.getItem('admin_authenticated');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('admin_authenticated', 'true');
            setPasswordError(false);
        } else {
            setPasswordError(true);
            setPassword('');
        }
    };

    // State Management
    const [quizzes, setQuizzes] = useState([]);
    const [services, setServices] = useState([]);
    const [activeTab, setActiveTab] = useState('quizzes');
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [filterType, setFilterType] = useState('all');
    const [loading, setLoading] = useState(false);

    // Service Form State
    const [newServiceTitle, setNewServiceTitle] = useState('');
    const [newServiceDesc, setNewServiceDesc] = useState('');
    const [newServiceUrl, setNewServiceUrl] = useState('');
    const [newServiceImage, setNewServiceImage] = useState('');
    const [newServiceCategory, setNewServiceCategory] = useState('');

    // Edit Modal State
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editQuestions, setEditQuestions] = useState([]);
    const [editImage, setEditImage] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Constants
    const filterTypes = ['all', 'Love', 'Career', 'Personality', 'Personality_Pet', 'Trendy', 'Food', 'Travel', 'Survival'];

    const personas = [
        { name: 'Dr. Freud (Psychology)', prompt: 'Create a deep psychological personality test.' },
        { name: 'Cupid (Romance)', prompt: 'Create a romantic love compatibility test.' },
        { name: 'Elon (Career)', prompt: 'Create a career aptitude test for the future.' },
        { name: 'Chef Gordon (Food)', prompt: 'Create a culinary taste preference test.' },
        { name: 'Explorer Jack (Travel)', prompt: 'Create a travel destination personality test.' },
        { name: 'Dr. Dolittle (Pet)', prompt: 'Create a pet companion compatibility test.' },
        { name: 'Trend Setter (Viral)', prompt: 'Create a viral gen-z trend test.' },
        { name: 'Survivor (Hero)', prompt: 'Create a survival instinct and superpower test.' }
    ];

    // Fetch Quizzes and Services
    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/quizzes');
            const data = await response.json();
            const quizList = data.quizzes || data || [];
            // Sort by ID descend
            quizList.sort((a, b) => b.id - a.id);
            setQuizzes(quizList);
            setFilteredQuizzes(quizList);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/services');
            const data = await response.json();
            setServices(data.services || []);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchQuizzes();
            fetchServices();
        }
    }, [isAuthenticated]);

    // Filtering
    useEffect(() => {
        if (filterType === 'all') {
            setFilteredQuizzes(quizzes);
        } else {
            setFilteredQuizzes(quizzes.filter(q => q.category === filterType));
        }
    }, [filterType, quizzes]);

    // Format Date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    // Get Type Label
    const getTypeLabel = (type) => {
        const labels = {
            'Love': 'Romance',
            'Career': 'Career',
            'Personality': 'Personality',
            'Personality_Pet': 'Pet',
            'Trendy': 'Trend',
            'Food': 'Food',
            'Travel': 'Travel',
            'Survival': 'Superhero'
        };
        return labels[type] || type;
    };

    // --- Actions ---

    const handleGenerate = async (persona) => {
        setLoading(true);
        try {
            // Call actual AI endpoint to create quiz
            const response = await fetch('http://localhost:8000/api/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: persona.prompt, // Backend expects 'topic'
                    generate_images: true
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(`✅ Quiz Generated Successfully!\nTitle: ${data.quiz.title}`);
                fetchQuizzes();
            } else {
                const err = await response.json();
                console.error("AI Generation Failed:", err);
                alert(`❌ Generation Failed: ${err.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert("❌ Network Error during generation.");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id) => {
        try {
            const quiz = quizzes.find(q => q.id === id);
            const newStatus = (quiz.status === 'visible' || quiz.is_active !== false) ? 'hidden' : 'visible';

            // Optimistic update
            setQuizzes(prev => prev.map(q => q.id === id ? { ...q, status: newStatus, is_active: newStatus === 'visible' } : q));

            await fetch(`http://localhost:8000/api/quizzes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, is_active: newStatus === 'visible' })
            });

        } catch (error) {
            console.error("Error toggling status:", error);
            fetchQuizzes(); // Revert
        }
    };

    const deleteQuiz = async (id) => {
        if (!window.confirm("Are you sure you want to delete this quiz?")) return;
        try {
            await fetch(`http://localhost:8000/api/quizzes/${id}`, { method: 'DELETE' });
            setQuizzes(prev => prev.filter(q => q.id !== id));
        } catch (error) {
            console.error("Error deleting quiz:", error);
        }
    };

    const handleAddService = async () => {
        if (!newServiceTitle || !newServiceUrl) {
            alert("Title and URL are required!");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newServiceTitle,
                    description: newServiceDesc,
                    url: newServiceUrl,
                    image_url: newServiceImage || 'https://via.placeholder.com/150',
                    category: newServiceCategory || 'Other'
                })
            });

            if (response.ok) {
                alert("✅ Service Added!");
                setNewServiceTitle('');
                setNewServiceDesc('');
                setNewServiceUrl('');
                setNewServiceImage('');
                setNewServiceCategory('');
                fetchServices();
            } else {
                alert("Failed to add service");
            }
        } catch (error) {
            console.error("Error adding service:", error);
            alert("Error adding service");
        }
    };

    // --- Edit Modal Functions ---

    const openEditModal = async (quiz) => {
        setEditingQuiz(quiz);
        setEditTitle(quiz.title || '');
        setEditDescription(quiz.description || '');
        setEditCategory(quiz.category || '');
        setEditImage(null);
        setEditImagePreview(quiz.image_url || '');
        setEditQuestions([]);

        // Fetch full details including questions
        try {
            const response = await fetch(`http://localhost:8000/api/quizzes/${quiz.id}`);
            const data = await response.json();
            if (data.questions) {
                setEditQuestions(data.questions);
            }
        } catch (error) {
            console.error("Error fetching quiz details:", error);
            alert("Warning: Could not load questions.");
        }
    };

    const closeEditModal = () => {
        setEditingQuiz(null);
        setEditTitle('');
        setEditDescription('');
        setEditCategory('');
        setEditQuestions([]);
        setEditImage(null);
        setEditImagePreview('');
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...editQuestions];
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
        setEditQuestions(updatedQuestions);
    };

    const handleImageSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEditImage(file);
            setEditImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setEditImage(file);
            setEditImagePreview(URL.createObjectURL(file));
        }
    };

    const saveQuiz = async () => {
        if (!editingQuiz) return;

        try {
            const response = await fetch(`http://localhost:8000/api/quizzes/${editingQuiz.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    category: editCategory,
                    questions: editQuestions,
                    // image handling would need form data or base64 usually, sticking to JSON for now
                    image_url: editImagePreview // Simplification
                }),
            });

            if (response.ok) {
                setQuizzes(prev => prev.map(q =>
                    q.id === editingQuiz.id
                        ? { ...q, title: editTitle, description: editDescription, category: editCategory, questions: editQuestions }
                        : q
                ));
                alert('✅ Quiz updated successfully!');
                closeEditModal();
            } else {
                alert('Failed to update quiz.');
            }
        } catch (error) {
            console.error('Error updating quiz:', error);
            alert('Error updating quiz.');
        }
    };

    // --- Render ---

    // 1. Login View
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFF0F6]">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-2 border-pink-200">
                    <h2 className="text-2xl font-black text-[#FF2D85] mb-6 text-center">🔐 Admin Access</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Admin Password"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#FF2D85] focus:outline-none transition-colors"
                            />
                            {passwordError && (
                                <p className="text-red-500 text-sm font-bold mt-2 ml-1">🚫 Access Denied. Try again.</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[#FF2D85] text-white font-bold py-3 rounded-xl hover:bg-[#E01E70] transition-colors shadow-lg shadow-pink-200"
                        >
                            Unlock Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // 2. Dashboard View
    return (
        <>
            {/* Edit Modal */}
            {editingQuiz && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">✏️ Edit Quiz</h3>
                            <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2D85]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-2">Description</label>
                                        <textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2D85] resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-2">Category</label>
                                        <select
                                            value={editCategory}
                                            onChange={(e) => setEditCategory(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2D85]"
                                        >
                                            <option value="">Select Category</option>
                                            {filterTypes.filter(t => t !== 'all').map(t => (
                                                <option key={t} value={t}>{getTypeLabel(t)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-2">Quiz Image</label>
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleDrop}
                                        className={`border-2 border-dashed rounded-lg h-full min-h-[160px] flex flex-col items-center justify-center p-4 transition-colors cursor-pointer ${isDragging
                                            ? 'border-[#FF2D85] bg-pink-50'
                                            : 'border-gray-300 hover:border-[#FF2D85]'
                                            }`}
                                        onClick={() => document.getElementById('image-upload').click()}
                                    >
                                        <input
                                            type="file"
                                            id="image-upload"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                        {editImagePreview ? (
                                            <div className="relative w-full h-full">
                                                <img
                                                    src={editImagePreview}
                                                    alt="Preview"
                                                    className="w-full h-40 object-cover rounded-lg"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditImage(null);
                                                        setEditImagePreview('');
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs font-bold hover:bg-red-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-3xl mb-2">📷</span>
                                                <p className="text-xs text-gray-400">Click or Drag Image</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h4 className="text-lg font-bold text-gray-800 mb-4">📝 Questions ({editQuestions.length})</h4>
                                <div className="space-y-6">
                                    {editQuestions.map((q, idx) => (
                                        <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-[#FF2D85] uppercase tracking-wider">Question {idx + 1}</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={q.question_text || ''}
                                                onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)}
                                                className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 text-sm font-bold"
                                                placeholder="Enter question text..."
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="text-xs font-semibold text-gray-500 mb-1 block">Option A</span>
                                                    <input
                                                        type="text"
                                                        value={q.option_a || ''}
                                                        onChange={(e) => handleQuestionChange(idx, 'option_a', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-300 text-sm"
                                                        placeholder="Option A"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-gray-500 mb-1 block">Option B</span>
                                                    <input
                                                        type="text"
                                                        value={q.option_b || ''}
                                                        onChange={(e) => handleQuestionChange(idx, 'option_b', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-300 text-sm"
                                                        placeholder="Option B"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex gap-3 bg-white">
                            <button
                                onClick={closeEditModal}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveQuiz}
                                className="flex-1 px-4 py-3 bg-[#FF2D85] text-white rounded-xl font-bold hover:bg-[#E01E70] transition-colors shadow-lg shadow-pink-200"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="min-h-screen bg-[#FFF0F6] p-8 pt-24 font-sans text-gray-800">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <header className="mb-10 text-center">
                        <h1 className="text-4xl font-black text-[#FF2D85] mb-2 drop-shadow-sm">
                            ⚡ AI POWER STATION
                        </h1>
                    </header>

                    {/* Tabs */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white p-2 rounded-full shadow-lg flex gap-2">
                            <button
                                onClick={() => setActiveTab('quizzes')}
                                className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'quizzes' ? 'bg-[#FF2D85] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                🧩 Quizzes
                            </button>
                            <button
                                onClick={() => setActiveTab('services')}
                                className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'services' ? 'bg-[#FF2D85] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                🔗 AI Services
                            </button>
                        </div>
                    </div>

                    {/* AI Buttons (Only for Quizzes) */}
                    {activeTab === 'quizzes' && (
                        <section className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-3xl p-8 border-4 border-[#FF2D85] shadow-lg mb-12">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {personas.map((persona, index) => {
                                    const pastelColors = [
                                        'bg-blue-100 hover:bg-blue-200',
                                        'bg-yellow-100 hover:bg-yellow-200',
                                        'bg-green-100 hover:bg-green-200',
                                        'bg-purple-100 hover:bg-purple-200',
                                        'bg-pink-100 hover:bg-pink-200',
                                        'bg-orange-100 hover:bg-orange-200',
                                        'bg-teal-100 hover:bg-teal-200',
                                        'bg-rose-100 hover:bg-rose-200'
                                    ];
                                    const colorClass = pastelColors[index % pastelColors.length];

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleGenerate(persona)}
                                            disabled={loading}
                                            className={`group relative p-6 flex flex-col items-center justify-center transition-all duration-200 transform
                                                sticker-tile ${colorClass} ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform filter drop-shadow-sm">
                                                {index === 0 ? '🧠' : index === 1 ? '💘' : index === 2 ? '🚀' : index === 3 ? '🍳' : index === 4 ? '✈️' : index === 5 ? '🐾' : index === 6 ? '✨' : '🦸'}
                                            </span>
                                            <span className="font-black text-sm text-gray-800 text-center leading-tight">
                                                {persona.name.split(' (')[0]}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                                                {persona.name.match(/\((.*?)\)/)?.[1] || 'AI'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {loading && (
                                <div className="mt-6 flex items-center justify-center gap-3">
                                    <div className="w-8 h-8 border-4 border-[#FF2D85] border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-[#FF2D85] font-bold animate-pulse">AI is generating your quiz...</span>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Dashboard Content */}
                    <section className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-[#FF2D85] to-pink-400 p-4 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-white">
                                {activeTab === 'quizzes' ? '🎮 Quiz Management' : '🔗 Service Management'}
                            </h2>
                        </div>

                        {activeTab === 'quizzes' ? (
                            <>
                                {/* Filters */}
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex flex-wrap gap-2">
                                        {filterTypes.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setFilterType(type)}
                                                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${filterType === type
                                                    ? 'bg-[#FF2D85] text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {type === 'all' ? 'All' : getTypeLabel(type)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Table */}
                                {loading && !quizzes.length ? (
                                    <div className="p-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FF2D85] border-t-transparent mb-4"></div>
                                        <p className="text-gray-500">Loading quizzes...</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                                    <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                                                    <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                                                    <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredQuizzes.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="p-8 text-center text-gray-400">
                                                            No quizzes found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredQuizzes.map((quiz) => (
                                                        <tr key={quiz.id} className="hover:bg-pink-50 transition-colors">
                                                            <td className="p-4 text-sm text-gray-600 font-mono">
                                                                {quiz.id?.toString().slice(0, 8)}...
                                                            </td>
                                                            <td className="p-4">
                                                                <button
                                                                    onClick={() => openEditModal(quiz)}
                                                                    className="font-medium text-gray-900 hover:text-[#FF2D85] hover:underline text-left transition-colors"
                                                                >
                                                                    {quiz.title}
                                                                </button>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <span className="inline-block px-3 py-1 bg-pink-100 text-[#FF2D85] rounded-full text-sm font-medium">
                                                                    {getTypeLabel(quiz.category)}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-center text-sm text-gray-600">
                                                                {formatDate(quiz.created_at)}
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <button
                                                                    onClick={() => toggleStatus(quiz.id)}
                                                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${quiz.status === 'visible' || quiz.is_active !== false
                                                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                                                        : 'bg-red-500 text-white hover:bg-red-600'
                                                                        }`}
                                                                >
                                                                    {quiz.status === 'visible' || quiz.is_active !== false ? 'ON' : 'OFF'}
                                                                </button>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <button
                                                                    onClick={() => deleteQuiz(quiz.id)}
                                                                    className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-500 rounded-lg transition-all duration-200"
                                                                >
                                                                    🗑️ Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-6">
                                {/* Add Service Form */}
                                <div className="bg-pink-50 rounded-xl p-6 mb-8 border border-pink-100">
                                    <h3 className="text-lg font-bold text-[#FF2D85] mb-4">✨ Add New AI Service</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Service Name"
                                            value={newServiceTitle}
                                            onChange={(e) => setNewServiceTitle(e.target.value)}
                                            className="px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#FF2D85]"
                                        />
                                        <select
                                            value={newServiceCategory}
                                            onChange={(e) => setNewServiceCategory(e.target.value)}
                                            className="px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#FF2D85]"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Visual">Visual / Face</option>
                                            <option value="Fortune">Fortune / Tarot</option>
                                            <option value="Fun">Fun / Anime</option>
                                            <option value="Utility">Utility</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Service URL (https://...)"
                                            value={newServiceUrl}
                                            onChange={(e) => setNewServiceUrl(e.target.value)}
                                            className="px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#FF2D85]"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Image URL"
                                            value={newServiceImage}
                                            onChange={(e) => setNewServiceImage(e.target.value)}
                                            className="px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#FF2D85]"
                                        />
                                        <div className="md:col-span-2">
                                            <textarea
                                                placeholder="Description (Short & Catchy)"
                                                value={newServiceDesc}
                                                onChange={(e) => setNewServiceDesc(e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-[#FF2D85]"
                                                rows="2"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddService}
                                        className="bg-[#FF2D85] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#E01E70] transition-colors shadow-md"
                                    >
                                        + Add Service
                                    </button>
                                </div>

                                {/* Services List */}
                                <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Service Name</th>
                                                <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">URL</th>
                                                <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {services.map((svc) => (
                                                <tr key={svc.id} className="hover:bg-pink-50 transition-colors">
                                                    <td className="p-4 flex items-center gap-3">
                                                        <img src={svc.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                        <div>
                                                            <div className="font-bold text-gray-800">{svc.title}</div>
                                                            <div className="text-xs text-gray-500">{svc.description}</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-blue-500 truncate max-w-[200px]">
                                                        <a href={svc.url} target="_blank" rel="noreferrer" className="hover:underline">{svc.url}</a>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-500">{svc.category}</span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm('Delete service?')) {
                                                                    await fetch(`http://localhost:8000/api/services/${svc.id}`, { method: 'DELETE' });
                                                                    fetchServices();
                                                                }
                                                            }}
                                                            className="text-red-500 hover:text-red-700 font-bold text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
};

export default Admin;