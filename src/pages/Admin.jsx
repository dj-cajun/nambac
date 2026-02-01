import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Admin = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [externalUrl, setExternalUrl] = useState('');

    /**
     * 데이터를 가져오는 함수 (재사용을 위해 선언)
     */
    const loadData = async () => {
        const { data, error } = await supabase
            .from('quizzes')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) {
            setQuizzes(data);
        } else {
            console.error('Data Fetch Error:', error);
        }
    };

    /**
     * useEffect 안에서 직접 호출하지 않고, 
     * 마운트 시점에 한 번만 데이터를 가져오도록 설정
     */
    useEffect(() => {
        let isMounted = true;

        const initialize = async () => {
            const { data, error } = await supabase
                .from('quizzes')
                .select('*')
                .order('created_at', { ascending: false });

            if (isMounted && !error) {
                setQuizzes(data);
            }
        };

        initialize();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleAddQuiz = async (e) => {
        e.preventDefault();
        const { error } = await supabase
            .from('quizzes')
            .insert([{
                title,
                description,
                external_url: externalUrl,
                category: 'Fresh Picks'
            }]);

        if (!error) {
            setTitle('');
            setDescription('');
            setExternalUrl('');
            loadData(); // 목록 새로고침
            alert('성공적으로 등록되었습니다!');
        } else {
            alert('등록 실패: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            const { error } = await supabase.from('quizzes').delete().eq('id', id);
            if (!error) loadData();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 pt-24 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-[#FF85A1] mb-2">nambac Admin Panel</h1>
                    <p className="text-gray-500">호치민 트렌드를 지배하는 관리자 화면입니다.</p>
                </header>

                {/* 등록 폼 */}
                <section className="bg-white rounded-3xl p-8 shadow-sm border border-[#FFD1DC] mb-10">
                    <h2 className="text-xl font-bold mb-6 text-gray-700">새로운 콘텐츠 등록</h2>
                    <form onSubmit={handleAddQuiz} className="space-y-4">
                        <input
                            type="text"
                            placeholder="제목을 입력하세요"
                            className="w-full p-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF85A1]"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="설명을 입력하세요"
                            className="w-full p-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF85A1]"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <input
                            type="url"
                            placeholder="연동 URL (n8n 등)"
                            className="w-full p-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF85A1]"
                            value={externalUrl}
                            onChange={(e) => setExternalUrl(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="w-full bg-[#FF85A1] hover:bg-[#FF6B8E] text-white font-bold py-4 rounded-2xl transition-all"
                        >
                            등록 완료
                        </button>
                    </form>
                </section>

                {/* 리스트 출력 */}
                <section>
                    <h2 className="text-xl font-bold mb-6 text-gray-700">콘텐츠 리스트</h2>
                    <div className="grid gap-4">
                        {quizzes.map((quiz) => (
                            <div key={quiz.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                                <div>
                                    <h3 className="font-bold text-lg">{quiz.title}</h3>
                                    <p className="text-sm text-gray-400 truncate max-w-md">{quiz.external_url}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(quiz.id)}
                                    className="text-red-400 hover:text-red-600 font-medium px-4 py-2"
                                >
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Admin;