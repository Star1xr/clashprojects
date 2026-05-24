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
  const [manualToken, setManualToken] = useState("");
  
  // State for Real GitHub Data
  const [githubData, setGithubData] = useState<any>(null);

  const cardsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const GITHUB_CLIENT_ID = "Ov23liSLBfnFPAQdMkhC"; 

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const savedToken = localStorage.getItem('github_token');

    if (code) {
      handleTokenExchange(code);
      window.history.replaceState({}, document.title, "/");
    } else if (savedToken) {
      fetchRealGithubData(savedToken);
    }
  }, []);
const handleTokenExchange = async (code: string) => {
  setIsLoading(true);
  setError(null);
  try {
    // Use relative path for production (Vercel), or localhost for dev
    const apiUrl = import.meta.env.PROD ? '/api/authenticate' : 'http://localhost:8000/authenticate';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: code })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Backend authentication failed");
    }

    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('github_token', data.access_token);
      fetchRealGithubData(data.access_token);
    } else {
      throw new Error("No access token returned from backend");
    }
  } catch (err: any) {
    console.error("Auth Error:", err);
    const isDev = !import.meta.env.PROD;
    setError(isDev 
      ? "Local Dev Error: Make sure your Python server is running on port 8000." 
      : "Production Error: The Vercel backend is not responding. Check your environment variables.");
    setIsLoading(false);
  }
};

  const fetchRealGithubData = async (token: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch User Profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const user = await userRes.json();
      if (!userRes.ok) {
        localStorage.removeItem('github_token');
        throw new Error(`GitHub Profile Error: ${userRes.status}`);
      }

      // 2. Fetch Repos
      const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const reposData = await reposRes.json();
      const repos = Array.isArray(reposData) 
        ? reposData.map((r: any) => ({ name: r.name, stars: r.stargazers_count }))
        : [];

      // 3. Fetch Recent Commits (via Events)
      // Increase per_page to 100 to find real PushEvents in a busy stream
      const eventsRes = await fetch(`https://api.github.com/users/${user.login}/events`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const eventsData = await eventsRes.json();
      
      const realPushEvents = Array.isArray(eventsData)
        ? eventsData.filter((e: any) => e.type === "PushEvent")
        : [];

      const commits = realPushEvents.slice(0, 5).map((e: any) => {
        const fullRepoName = e.repo?.name;
        const commitsInPayload = e.payload?.commits || [];
        const msg = commitsInPayload.length > 0 ? commitsInPayload[0].message : "Commit activity";
        const sha = commitsInPayload.length > 0 ? commitsInPayload[0].sha : e.payload?.head;

        return {
          repo: fullRepoName?.split('/')[1] || fullRepoName || "unknown-repo",
          msg: msg,
          date: e.created_at,
          url: sha ? `https://github.com/${fullRepoName}/commit/${sha}` : `https://github.com/${fullRepoName}`
        };
      });

      // Fallback if no PushEvents found
      const finalCommits = commits.length > 0 ? commits : (Array.isArray(eventsData) ? eventsData.slice(0, 5).map((e: any) => ({
        repo: e.repo?.name?.split('/')[1] || "Activity",
        msg: `${e.type.replace('Event', '')} activity`,
        date: e.created_at,
        url: `https://github.com/${e.repo?.name}`
      })) : []);

      setGithubData({ user, repos, commits: finalCommits });
      setIsLoggedIn(true);
      setError(null);
    } catch (err: any) {
      console.error("Data fetching error:", err);
      setError(`Auth Success, but Data Fetch Failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading || error) {
    return (
      <div className="app-container loading-view">
        <div className="loading-sketchy" style={{ maxWidth: '500px' }}>
          <h1>{error ? "Backend Check" : "Syncing with GitHub..."}</h1>
          {error && (
            <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.05)', padding: '1.5rem', borderRadius: '1rem', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
              <label style={{ fontSize: '0.8rem', fontWeight: '800' }}>OR TEST WITH PERSONAL ACCESS TOKEN:</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input 
                  type="password" 
                  placeholder="Paste ghp_token here" 
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--accent-color)' }}
                />
                <button onClick={() => fetchRealGithubData(manualToken)} className="get-in-touch-button" style={{ height: 'auto', padding: '0.5rem 1rem' }}>Go</button>
              </div>
              <p style={{ fontSize: '0.7rem', marginTop: '1rem', opacity: 0.6 }}>* Generate a token in GitHub Settings &gt; Developer Settings &gt; Personal Access Tokens (classic).</p>
            </div>
          )}
          {!error && <div className="sketchy-progress"></div>}
        </div>
      </div>
    );
  }

  if (isLoggedIn && githubData) {
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
          userData={githubData.user}
          repos={githubData.repos}
          commits={githubData.commits}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onLogout={() => { 
            setIsLoggedIn(false); 
            setGithubData(null); 
            window.localStorage.removeItem('github_token');
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
        
        <div className="header-center">
          <SearchBar />
        </div>

        <div className="header-right">
          <ThemeSwitch isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>
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

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onGithubLogin={handleGithubLogin} />}
      {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
      <footer className="app-footer"><p>&copy; 2026 clashprojects. All rights reserved.</p></footer>
    </div>
  );
}

export default App;
