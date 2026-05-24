import { useState, useEffect, useRef } from 'react';
import './App.css';
import './styles/theme.css';
import ThemeSwitch from './components/ThemeSwitch/ThemeSwitch';
import GetInTouchButton from './components/Buttons/GetInTouchButton';
import GithubStarButton from './components/Buttons/GithubStarButton';
import SearchBar from './components/SearchBar/SearchBar';
import ProjectCard from './components/ProjectCard/ProjectCard';
import ContactSection from './components/Contact/ContactSection';
import LoginModal from './components/LoginModal/LoginModal';
import Dashboard from './components/Dashboard/Dashboard';
import ContactModal from './components/Contact/ContactModal';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [cardsVisible, setCardsVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Unified State for Real Git Data (GitHub or GitLab)
  const [gitData, setGitData] = useState<any>(null);

  const cardsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const GITHUB_CLIENT_ID = "Ov23liSLBfnFPAQdMkhC"; 

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const token = urlParams.get('token');
    const provider = urlParams.get('provider');
    
    const savedToken = localStorage.getItem('git_token');
    const savedProvider = localStorage.getItem('git_provider');

    if (code) {
      // GitHub traditional code-exchange flow
      handleGithubTokenExchange(code);
      window.history.replaceState({}, document.title, "/");
    } else if (token && provider) {
      // GitLab or new unified direct-token flow
      localStorage.setItem('git_token', token);
      localStorage.setItem('git_provider', provider);
      fetchRealGitData(token, provider);
      window.history.replaceState({}, document.title, "/");
    } else if (savedToken && savedProvider) {
      fetchRealGitData(savedToken, savedProvider);
    }
  }, []);

  const handleGithubTokenExchange = async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.PROD ? '/api/authenticate' : 'http://localhost:8000/authenticate';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Backend authentication failed");
      }

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem('git_token', data.access_token);
        localStorage.setItem('git_provider', 'github');
        fetchRealGitData(data.access_token, 'github');
      } else {
        throw new Error("No access token returned from backend");
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError("Authentication failed. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  const fetchRealGitData = async (token: string, provider: string) => {
    setIsLoading(true);
    try {
      if (provider === 'github') {
        await fetchGithubData(token);
      } else if (provider === 'gitlab') {
        await fetchGitlabData(token);
      }
      setIsLoggedIn(true);
      setError(null);
    } catch (err: any) {
      console.error("Data fetching error:", err);
      setError(`Auth Success, but Data Fetch Failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGithubData = async (token: string) => {
    // 1. Fetch User Profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const user = await userRes.json();
    if (!userRes.ok) throw new Error("GitHub Profile Error");

    // 2. Fetch Repos
    const reposRes = await fetch('https://api.github.com/user/repos?type=public&sort=updated&per_page=100', {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const reposData = await reposRes.json();
    const repos = Array.isArray(reposData) 
      ? reposData.map((r: any) => ({ name: r.name, stars: r.stargazers_count }))
      : [];

    // 3. Fetch Recent Commits
    const eventsRes = await fetch(`https://api.github.com/users/${user.login}/events/public?per_page=50`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const eventsData = await eventsRes.json();
    const pushEvents = Array.isArray(eventsData) ? eventsData.filter((e: any) => e.type === "PushEvent") : [];

    const commits = await Promise.all(
      pushEvents.slice(0, 5).map(async (e: any) => {
        const repoFullName = e.repo?.name;
        const commitInPayload = e.payload?.commits?.[0];
        return {
          repo: repoFullName?.split('/')[1] || repoFullName,
          msg: commitInPayload?.message?.split('\n')[0] || "Push activity",
          date: e.created_at,
          url: `https://github.com/${repoFullName}/commit/${commitInPayload?.sha || e.payload?.head}`
        };
      })
    );

    setGitData({ 
      user: { login: user.login, avatar_url: user.avatar_url, bio: user.bio || "GitHub Developer" }, 
      repos, 
      commits 
    });
  };

  const fetchGitlabData = async (token: string) => {
    // 1. Fetch User Profile
    const userRes = await fetch('https://gitlab.com/api/v4/user', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const user = await userRes.json();
    if (!userRes.ok) throw new Error("GitLab Profile Error");

    // 2. Fetch Projects
    const projectsRes = await fetch('https://gitlab.com/api/v4/projects?membership=true&min_access_level=20&order_by=last_activity_at&per_page=100', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const projectsData = await projectsRes.json();
    const repos = Array.isArray(projectsData) 
      ? projectsData.map((p: any) => ({ name: p.name, stars: p.star_count }))
      : [];

    // 3. Fetch Events
    const eventsRes = await fetch('https://gitlab.com/api/v4/events?action=pushed&per_page=20', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const eventsData = await eventsRes.json();
    
    const commits = Array.isArray(eventsData) 
      ? eventsData.slice(0, 5).map((e: any) => ({
          repo: e.project_id.toString(),
          msg: e.push_data?.commit_title || "Pushed to GitLab",
          date: e.created_at,
          url: `https://gitlab.com/dashboard/projects`
        }))
      : [];

    setGitData({ 
      user: { login: user.username, avatar_url: user.avatar_url, bio: user.bio || "GitLab Developer" }, 
      repos, 
      commits 
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const cardsObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setCardsVisible(true);
    }, { threshold: 0.1 });

    const contactObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setContactVisible(true);
    }, { threshold: 0.1 });

    if (cardsRef.current) cardsObserver.observe(cardsRef.current);
    if (contactRef.current) contactObserver.observe(contactRef.current);

    return () => {
      cardsObserver.disconnect();
      contactObserver.disconnect();
    };
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleGithubLogin = () => {
    const rootUrl = 'https://github.com/login/oauth/authorize';
    const options = {
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: window.location.origin,
      scope: 'user repo',
      state: Math.random().toString(36).substring(7),
      prompt: 'select_account'
    };
    const qs = new URLSearchParams(options);
    window.location.href = `${rootUrl}?${qs.toString()}`;
  };

  const handleGitlabLogin = () => {
    // Redirect to backend login route which will then redirect to GitLab
    const apiUrl = import.meta.env.PROD ? '/api/auth/gitlab/login' : 'http://localhost:8000/auth/gitlab/login';
    window.location.href = apiUrl;
  };

  if (isLoading || error) {
    return (
      <div className="app-container loading-view">
        <div className="loading-sketchy" style={{ maxWidth: '500px' }}>
          <h1>{error ? "Backend Check" : "Syncing with Git..."}</h1>
          {error && (
            <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.05)', padding: '1.5rem', borderRadius: '1rem', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
              <button onClick={() => window.location.reload()} className="get-in-touch-button">Retry</button>
            </div>
          )}
          {!error && <div className="sketchy-progress"></div>}
        </div>
      </div>
    );
  }

  if (isLoggedIn && gitData) {
    return (
      <div className="app-container">
        <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
          <filter id="sketchy">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
          </filter>
          <filter id="sketchy-sm">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
          </filter>
        </svg>
        <Dashboard 
          userData={gitData.user}
          repos={gitData.repos}
          commits={gitData.commits}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onLogout={() => { 
            setIsLoggedIn(false); 
            setGitData(null); 
            window.localStorage.removeItem('git_token');
            window.localStorage.removeItem('git_provider');
            window.location.reload();
          }} 
        />
      </div>
    );
  }

  return (
    <div className={`app-container ${(showLoginModal || showContactModal) ? 'blurred' : ''}`}>
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
        <filter id="sketchy">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
        </filter>
        <filter id="sketchy-sm">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
        </filter>
      </svg>

      <header className="app-header">
        <div className="header-left">
          <div className="logo">clashprojects</div>
        </div>
        <div className="header-center"><SearchBar /></div>
        <div className="header-right"><ThemeSwitch isDarkMode={isDarkMode} toggleTheme={toggleTheme} /></div>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-content">
            <h1>Connect through Git, Build together.</h1>
            <p>clashprojects is the platform where developers unite, manage projects, and showcase their collaborative spirit.</p>
            <div className="hero-actions">
              <div onClick={() => setShowLoginModal(true)}><GetInTouchButton text="Get started" /></div>
              <GithubStarButton />
            </div>
          </div>
        </section>

        <section className="features-section" ref={cardsRef}>
          <div className="section-header"><h2>Why clashprojects?</h2><div className="sketchy-underline"></div></div>
          <div className="cards-grid">
            {[
              { title: "Git Integration", description: "Seamlessly connect your GitHub or GitLab accounts to manage projects directly.", icon: "🌿" },
              { title: "Real-time Collab", description: "Work together with your team in real-time, matching skills with project needs.", icon: "🤝", isSoon: true },
              { title: "Artistic Analytics", description: "Experience your Git evolution through our cozy, hand-drawn dashboard. Track real-time commits and get deep insights into your repository stars with a unique human touch.", icon: "📊" },
              { title: "Smart Matching", description: "Find developers who fit your project's stack and goals perfectly using AI.", icon: "✨", isSoon: true }
            ].map((feature: any, index) => (
              <ProjectCard 
                key={index} 
                index={index} 
                title={feature.title} 
                description={feature.description} 
                icon={feature.icon} 
                isVisible={cardsVisible}
                isSoon={feature.isSoon}
              />
            ))}
          </div>
        </section>

        <div ref={contactRef}>
          <ContactSection isVisible={contactVisible} onContactClick={() => setShowContactModal(true)} />
        </div>
      </main>

      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onGithubLogin={handleGithubLogin} 
          onGitlabLogin={handleGitlabLogin}
        />
      )}
      {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
      <footer className="app-footer"><p>&copy; 2026 clashprojects. All rights reserved.</p></footer>
    </div>
  );
}

export default App;
