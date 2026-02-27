import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/20">
        <div className="max-w-[1300px] mx-auto px-8 py-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <svg width="132" height="35" viewBox="0 0 132 35" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M14.9905 10.8289C15.5656 7.70523 16.0316 7.23916 19.1546 6.66398C16.0316 6.0888 15.5656 5.62275 14.9905 2.49902C14.4155 5.62275 13.9495 6.0888 10.8265 6.66398C13.9495 7.23916 14.4155 7.70523 14.9905 10.8289ZM0 10.8289L9.5773 14.9939V6.66398L0 10.8289ZM19.1546 10.8289L9.5773 14.9939V25.8228L19.1546 21.6579V10.8289Z" fill="#718CF9"/>
              <path d="M54.757 6.66406C49.4674 6.66406 45.1797 10.9527 45.1797 16.2435C45.1797 21.5342 49.4674 25.8229 54.757 25.8229C60.0465 25.8229 64.3342 21.5342 64.3342 16.2435C64.3342 10.9527 60.0465 6.66406 54.757 6.66406ZM54.757 21.658C51.7673 21.658 49.3437 19.2339 49.3437 16.2435C49.3437 13.253 51.7673 10.829 54.757 10.829C57.7468 10.829 60.1702 13.253 60.1702 16.2435C60.1702 19.2339 57.7468 21.658 54.757 21.658Z" fill="#718CF9"/>
              <path d="M75.1611 6.66406C69.8717 6.66406 65.584 10.9527 65.584 16.2435C65.584 21.5342 69.8717 25.8229 75.1611 25.8229C80.4508 25.8229 84.7385 21.5342 84.7385 16.2435C84.7385 10.9527 80.4508 6.66406 75.1611 6.66406ZM75.1611 21.658C72.1714 21.658 69.748 19.2339 69.748 16.2435C69.748 13.253 72.1714 10.829 75.1611 10.829C78.1509 10.829 80.5745 13.253 80.5745 16.2435C80.5745 19.2339 78.1509 21.658 75.1611 21.658Z" fill="#718CF9"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M100.978 0H105.142V16.2433V25.4063H100.978V24.147C99.4379 25.2042 97.5735 25.8227 95.5647 25.8227C90.275 25.8227 85.9873 21.5341 85.9873 16.2433C85.9873 10.9526 90.275 6.66393 95.5647 6.66393C97.5735 6.66393 99.4379 7.28253 100.978 8.33967V0ZM100.978 16.2433C100.978 13.2529 98.5544 10.8289 95.5647 10.8289C92.5749 10.8289 90.1513 13.2529 90.1513 16.2433C90.1513 19.2338 92.5749 21.6578 95.5647 21.6578C98.5544 21.6578 100.978 19.2338 100.978 16.2433Z" fill="#718CF9"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M107.224 0H111.388V4.16496H107.224V0ZM107.224 6.24744H111.388V25.4063H107.224V6.24744Z" fill="#718CF9"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M122.423 21.658C124.151 21.658 125.691 20.8474 126.682 19.5859H131.401C130.044 23.2282 126.537 25.8229 122.423 25.8229C117.133 25.8229 112.846 21.5342 112.846 16.2435C112.846 10.9527 117.133 6.66406 122.423 6.66406C127.713 6.66406 132 10.9527 132 16.2435V17.9199H127.571H117.274C117.98 20.0897 120.018 21.658 122.423 21.658ZM117.267 14.5879C117.967 12.4073 120.01 10.829 122.423 10.829C124.835 10.829 126.879 12.4073 127.578 14.5879H117.267Z" fill="#718CF9"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M24.5684 16.2435C24.5684 10.9527 28.856 6.66406 34.1455 6.66406C36.1546 6.66406 38.019 7.28266 39.5589 8.33981V7.08055H43.7229V25.4065C43.7171 30.6921 39.4315 34.9753 34.1455 34.9753C28.8597 34.9753 24.5742 30.6921 24.5684 25.4065H28.7324C28.7382 28.3918 31.1591 30.8104 34.1455 30.8104C37.132 30.8104 39.5531 28.3918 39.5589 25.4065V24.1471C38.019 25.2043 36.1546 25.8229 34.1455 25.8229C28.856 25.8229 24.5684 21.5342 24.5684 16.2435ZM28.7324 16.2435C28.7324 19.2339 31.1558 21.658 34.1455 21.658C37.1355 21.658 39.5589 19.2339 39.5589 16.2435C39.5589 13.253 37.1355 10.829 34.1455 10.829C31.1558 10.829 28.7324 13.253 28.7324 16.2435Z" fill="#718CF9"/>
            </svg>

            {/* Nav Menu */}
            <div className="hidden md:flex items-center gap-8">
              <button className="text-[#A0A0A0] text-[16px] hover:text-white transition-colors flex items-center gap-2">
                Platform
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                  <path d="M8 11L0.205771 0.5L15.7942 0.5L8 11Z" fill="#A0A0A0"/>
                </svg>
              </button>
              <button className="text-[#A0A0A0] text-[16px] hover:text-white transition-colors flex items-center gap-2">
                Resources
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                  <path d="M8 11L0.205771 0.5L15.7942 0.5L8 11Z" fill="#A0A0A0"/>
                </svg>
              </button>
              <button className="text-[#A0A0A0] text-[16px] hover:text-white transition-colors flex items-center gap-2">
                Company
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                  <path d="M8 11L0.205771 0.5L15.7942 0.5L8 11Z" fill="#A0A0A0"/>
                </svg>
              </button>
              <Link to="#" className="text-[#A0A0A0] text-[16px] hover:text-white transition-colors">
                Pricing
              </Link>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 rounded-full bg-[#718CF9] text-[#141414] font-semibold text-[16px] hover:bg-[#5A70C7] transition-colors flex items-center gap-2">
              Get a Demo
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                <path d="M11.9092 8.1273L8.20463 11.8395C7.9997 12.0521 7.88631 12.3369 7.88887 12.6325C7.89144 12.9281 8.00975 13.2108 8.21833 13.4198C8.42691 13.6288 8.70907 13.7474 9.00405 13.75C9.29903 13.7525 9.5832 13.6388 9.79537 13.4335L15.4204 7.797C15.6313 7.58561 15.7498 7.29892 15.7498 7C15.7498 6.70107 15.6313 6.41439 15.4204 6.20299L9.79537 0.566449C9.5832 0.361103 9.29903 0.247467 9.00405 0.250043C8.70907 0.252608 8.42691 0.371171 8.21833 0.580174C8.00975 0.789188 7.89144 1.07193 7.88887 1.36752C7.88631 1.66309 7.9997 1.94785 8.20463 2.16046L11.9092 5.87269H1.125C0.826639 5.87269 0.540484 5.99146 0.329512 6.20287C0.11853 6.41428 0 6.70102 0 7C0 7.29898 0.11853 7.58572 0.329512 7.79713C0.540484 8.00854 0.826639 8.1273 1.125 8.1273H11.9092Z" fill="#141414"/>
              </svg>
            </button>
            <Link to="#" className="px-6 py-3 rounded-full border border-[#718CF9] text-[#718CF9] font-semibold text-[16px] hover:bg-[#718CF9]/10 transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[1300px] mx-auto px-8 pt-24 pb-16">
        <div className="text-center max-w-[1080px] mx-auto">
          {/* Hero Title */}
          <h1 className="text-[79px] font-medium leading-[88px] tracking-[-0.03em] mb-6">
            Become The AI{' '}
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></span>
              <span className="inline-block w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600"></span>
              <span className="inline-block w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600"></span>
              <span className="inline-block w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600"></span>
              <span className="inline-block w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-rose-600"></span>
              <span className="inline-block w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600"></span>
              <span className="inline-block w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600"></span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-[#A0A0A0] text-[17px] leading-[25px] max-w-[840px] mx-auto mb-12">
            Unlock AI search growth, own how LLMs talk about you and capture demand on ChatGPT, Gemini, and more - reaching billions who use AI daily.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-5 mb-16">
            <button className="px-8 py-4 rounded-full bg-[#718CF9] text-[#141414] font-semibold text-[16px] hover:bg-[#5A70C7] transition-colors flex items-center gap-3">
              Get a Demo
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                <path d="M11.9092 8.1273L8.20463 11.8395C7.9997 12.0521 7.88631 12.3369 7.88887 12.6325C7.89144 12.9281 8.00975 13.2108 8.21833 13.4198C8.42691 13.6288 8.70907 13.7474 9.00405 13.75C9.29903 13.7525 9.5832 13.6388 9.79537 13.4335L15.4204 7.797C15.6313 7.58561 15.7498 7.29892 15.7498 7C15.7498 6.70107 15.6313 6.41439 15.4204 6.20299L9.79537 0.566449C9.5832 0.361103 9.29903 0.247467 9.00405 0.250043C8.70907 0.252608 8.42691 0.371171 8.21833 0.580174C8.00975 0.789188 7.89144 1.07193 7.88887 1.36752C7.88631 1.66309 7.9997 1.94785 8.20463 2.16046L11.9092 5.87269H1.125C0.826639 5.87269 0.540484 5.99146 0.329512 6.20287C0.11853 6.41428 0 6.70102 0 7C0 7.29898 0.11853 7.58572 0.329512 7.79713C0.540484 8.00854 0.826639 8.1273 1.125 8.1273H11.9092Z" fill="#141414"/>
              </svg>
            </button>
            <button className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-[16px] hover:bg-white/5 transition-colors">
              Learn More
            </button>
          </div>

          {/* Dashboard Preview */}
          <div className="relative rounded-[30px] overflow-hidden border border-white/20">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/201b2ea3c2590a987d0146f2e3ae2cbc1399a9b6?width=2160" 
              alt="Dashboard Preview"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Company Logos Section */}
      <section className="border-t border-white/20">
        <div className="max-w-[1300px] mx-auto px-8 py-16">
          <p className="text-[#A0A0A0] text-[17px] leading-[25px] mb-10">
            Trusted by Leading Brands:
          </p>
          
          <div className="flex items-center justify-between gap-16 flex-wrap">
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/ccdcd1a14311c76ddcb2dcfdfa74889eec7460d8?width=280" alt="OpenAI" className="h-[34px] opacity-60 hover:opacity-100 transition-opacity" />
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/462e34fe6ea100739e2254c46626da459f7d8e14?width=366" alt="Salesforce" className="h-[42px] opacity-60 hover:opacity-100 transition-opacity" />
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/f593abbd4cf8c6a64f23cbf1cfdd72609498ce5a?width=292" alt="Anthropic" className="h-[25px] opacity-60 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="border-t border-white/20">
        <div className="max-w-[1300px] mx-auto px-8 py-24">
          <div className="max-w-[860px]">
            <div className="inline-flex px-5 py-2 rounded-full border border-white mb-10">
              <span className="text-white text-[15px]">About Us</span>
            </div>
            
            <h2 className="text-white text-[58px] font-medium leading-[66px] tracking-[-0.025em] mb-10">
              Unlock AI search growth, own how LLMs talk about you and capture demand on ChatGPT, Gemini, and more - reaching billions who use AI daily.
            </h2>

            <p className="text-[#A0A0A0] text-[21px] leading-[32px]">
              We are pioneering a new frontier in AI-driven search and discovery, helping businesses optimize their presence across the next generation of search platforms.
            </p>
          </div>
        </div>
      </section>

      {/* The New Frontier Section */}
      <section className="border-t border-white/20">
        <div className="max-w-[1300px] mx-auto px-8 py-24">
          <h2 className="text-white text-[58px] font-medium leading-[66px] tracking-[-0.025em] mb-6">
            The New Frontier for Organic Growth
          </h2>
          <p className="text-[#A0A0A0] text-[21px] leading-[32px] max-w-[840px] mb-24">
            CHATGPT JUST HIT 300M+ WEEKLY ACTIVE USERS—surpassing the combined audience of Google, Bing, and traditional search. As AI becomes the primary way people discover, research, and decide, optimizing for LLM visibility isn't optional—it's essential for organic growth.
          </p>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-[#262626] rounded-[35px] p-8 relative overflow-hidden">
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#718CF9] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-white text-[24px] font-semibold mb-4">Competitive Benchmarking</h3>
              <p className="text-[#A0A0A0] text-[17px] leading-[25px] mb-8">
                Track how your brand appears across LLMs compared to competitors in real-time.
              </p>
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/71d549828ad773eb2bab92d115a05770d0e4a2a1?width=1200" 
                alt="Competitive Benchmarking Dashboard"
                className="w-full rounded-[15px]"
              />
            </div>

            {/* Feature Card 2 */}
            <div className="bg-[#262626] rounded-[35px] p-8 relative overflow-hidden">
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#718CF9] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/>
                </svg>
              </div>
              <h3 className="text-white text-[24px] font-semibold mb-4">Visibility Analysis</h3>
              <p className="text-[#A0A0A0] text-[17px] leading-[25px] mb-8">
                Understand exactly how and where your brand shows up in AI-generated responses.
              </p>
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/8212dd83c57a4054456d77d657f73c0b8dce77c3?width=840" 
                alt="Visibility Analysis"
                className="w-full rounded-[15px]"
              />
            </div>

            {/* Feature Card 3 */}
            <div className="bg-[#262626] rounded-[35px] p-8 relative overflow-hidden">
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#718CF9] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2"/>
                  <path d="M3 9H21" stroke="white" strokeWidth="2"/>
                  <path d="M9 21V9" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="text-white text-[24px] font-semibold mb-4">Performance Dashboard</h3>
              <p className="text-[#A0A0A0] text-[17px] leading-[25px] mb-8">
                Monitor your AI visibility metrics with comprehensive, actionable insights at a glance.
              </p>
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/1fd306f98e58fe393e671055621ff74ad0ddf74b?width=840" 
                alt="Performance Dashboard"
                className="w-full rounded-[15px]"
              />
            </div>

            {/* Feature Card 4 */}
            <div className="bg-[#262626] rounded-[35px] p-8 relative overflow-hidden">
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#718CF9] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-white text-[24px] font-semibold mb-4">Sentiment Analysis</h3>
              <p className="text-[#A0A0A0] text-[17px] leading-[25px] mb-8">
                Track sentiment trends and how AI models perceive your brand over time.
              </p>
              <div className="bg-[#1A1A1A] rounded-[15px] p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[#A0A0A0] text-[14px] mb-2">Overall Sentiment Score</p>
                    <p className="text-white text-[42px] font-semibold">86.2 <span className="text-[#22C55E] text-[24px]">↑</span></p>
                  </div>
                  <div className="text-[#22C55E] text-[14px] font-medium">+12.3%</div>
                </div>
                <div className="h-[120px] relative">
                  <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
                    <path d="M0,60 Q100,30 200,45 T400,50" stroke="#22C55E" strokeWidth="3" fill="none"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature Card 5 */}
            <div className="bg-[#262626] rounded-[35px] p-8 relative overflow-hidden">
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#718CF9] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-white text-[24px] font-semibold mb-4">Global Monitoring</h3>
              <p className="text-[#A0A0A0] text-[17px] leading-[25px] mb-8">
                24/7 tracking of your brand mentions across all major AI platforms worldwide.
              </p>
              <div className="bg-[#1A1A1A] rounded-[15px] p-8">
                <div className="space-y-4">
                  {[
                    { name: 'ChatGPT', value: 92, color: '#22C55E' },
                    { name: 'Gemini', value: 87, color: '#3B82F6' },
                    { name: 'Claude', value: 84, color: '#F59E0B' },
                    { name: 'Perplexity', value: 79, color: '#8B5CF6' },
                  ].map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between mb-2">
                        <span className="text-white text-[14px]">{item.name}</span>
                        <span className="text-[#A0A0A0] text-[14px]">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-[#262626] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.value}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature Card 6 */}
            <div className="bg-[#262626] rounded-[35px] p-8 relative overflow-hidden">
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#718CF9] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-white text-[24px] font-semibold mb-4">Optimization Hub</h3>
              <p className="text-[#A0A0A0] text-[17px] leading-[25px] mb-8">
                Get AI-powered recommendations to improve your visibility and brand positioning.
              </p>
              <div className="bg-[#1A1A1A] rounded-[15px] p-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-[#262626] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-[14px] font-medium mb-1">Optimize Brand Descriptions</p>
                      <p className="text-[#A0A0A0] text-[12px]">Update your key messaging for better LLM comprehension</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-[#262626] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="#F59E0B" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-[14px] font-medium mb-1">Enhance Citation Sources</p>
                      <p className="text-[#A0A0A0] text-[12px]">Strengthen authoritative content that LLMs reference</p>
                    </div>
                  </div>
                  <div className="text-center pt-4">
                    <p className="text-[#718CF9] text-[32px] font-semibold">8/9</p>
                    <p className="text-[#A0A0A0] text-[12px]">recommendations completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AEO Pioneers Section */}
      <section className="border-t border-white/20 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-[#5A70C7] opacity-30 blur-[250px] rounded-full" />
        </div>

        <div className="max-w-[1300px] mx-auto px-8 py-24 relative">
          <h2 className="text-white text-[58px] font-medium leading-[66px] tracking-[-0.025em] mb-16">
            We are AEO Pioneers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1A1A1A]/80 backdrop-blur-sm rounded-[30px] p-8 border border-white/10">
              <p className="text-[#A0A0A0] text-[17px] leading-[28px] mb-6">
                AEO (AI Engine Optimization) is a paradigm shift from traditional SEO. While SEO focuses on ranking in search results, AEO ensures your brand is accurately represented when AI models generate responses.
              </p>
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/8212dd83c57a4054456d77d657f73c0b8dce77c3?width=840" 
                alt="Maven Logo"
                className="w-48 opacity-60"
              />
            </div>

            <div className="bg-[#1A1A1A]/80 backdrop-blur-sm rounded-[30px] p-8 border border-white/10">
              <p className="text-[#A0A0A0] text-[17px] leading-[28px] mb-6">
                With billions now using AI for research and discovery, optimizing for AI engines is no longer optional—it's essential for staying competitive and capturing organic demand in the AI-first era.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-8">
                {/* AI Platform Icons */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-40" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="border-t border-white/20 bg-[#0A0A0A]">
        <div className="max-w-[1300px] mx-auto px-8 py-24">
          <h2 className="text-white text-[58px] font-medium leading-[66px] tracking-[-0.025em] mb-4">
            ? Questions? Questions? Questions?
          </h2>
          <p className="text-white text-[32px] font-medium mb-16">
            We have the answers.
          </p>

          <div className="space-y-6">
            {[
              "What is AEO?",
              "What is AEO? Answer Engine Optimization Explained?",
              "How does AEO differ from SEO?",
              "Why is AEO important now?",
              "How can I get started with AEO today?",
              "Is Goodie suitable for all industry types?",
            ].map((question, i) => (
              <button
                key={i}
                className="w-full text-left px-8 py-6 rounded-lg border border-white/20 hover:border-[#718CF9] hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white text-[17px]">{question}</span>
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    className="text-[#A0A0A0] group-hover:text-[#718CF9] transition-colors"
                  >
                    <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20">
        <div className="max-w-[1300px] mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Column 1 */}
            <div>
              <h3 className="text-white text-[17px] font-semibold mb-6 border-b-2 border-[#A0A0A0] pb-2 inline-block">
                About Us
              </h3>
              <ul className="space-y-4">
                <li><Link to="#" className="text-[#A0A0A0] text-[17px] hover:text-white transition-colors">Our Story</Link></li>
                <li><Link to="#" className="text-[#A0A0A0] text-[17px] hover:text-white transition-colors">Team</Link></li>
                <li><Link to="#" className="text-[#A0A0A0] text-[17px] hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="text-white text-[17px] font-semibold mb-6 border-b-2 border-[#A0A0A0] pb-2 inline-block">
                Platform
              </h3>
              <ul className="space-y-4">
                <li><Link to="#" className="text-[#A0A0A0] text-[17px] hover:text-white transition-colors">Features</Link></li>
                <li><Link to="#" className="text-[#A0A0A0] text-[17px] hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="#" className="text-[#A0A0A0] text-[17px] hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="text-white text-[17px] font-semibold mb-6 border-b-2 border-[#A0A0A0] pb-2 inline-block">
                Resources
              </h3>
              <ul className="space-y-4">
                <li><Link to="#" className="text-[#A0A0A0] text-[17px] hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="#" className="text-[#A0A0A0] text-[17px] hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="#" className="text-[#A0A0A0] text-[17px] hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="text-white text-[17px] font-semibold mb-6 border-b-2 border-[#A0A0A0] pb-2 inline-block">
                Legal
              </h3>
              <ul className="space-y-4">
                <li><Link to="#" className="text-[#A0A0A0] text-[17px] hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="#" className="text-[#A0A0A0] text-[17px] hover:text-white transition-colors">Terms</Link></li>
                <li><Link to="#" className="text-[#A0A0A0] text-[17px] hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="flex items-center justify-between pt-8 border-t border-white/20">
            <div className="flex items-center gap-4">
              <p className="text-[#999A9A] text-[14px]">© Goodie 2025</p>
              <p className="text-[#999A9A] text-[14px]">All Rights Reserved</p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {/* Facebook */}
              <Link to="#" className="w-12 h-12 rounded-full bg-[#718CF9] flex items-center justify-center hover:bg-[#5A70C7] transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>

              {/* LinkedIn */}
              <Link to="#" className="w-12 h-12 rounded-full bg-[#718CF9] flex items-center justify-center hover:bg-[#5A70C7] transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 9H2V21H6V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>

              {/* Instagram */}
              <Link to="#" className="w-12 h-12 rounded-full bg-[#718CF9] flex items-center justify-center hover:bg-[#5A70C7] transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61992 14.1902 8.22773 13.4229 8.09406 12.5922C7.9604 11.7615 8.09206 10.9099 8.47032 10.1584C8.84858 9.40685 9.45418 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87658 12.63 8C13.4789 8.12588 14.2648 8.52146 14.8717 9.1283C15.4785 9.73515 15.8741 10.5211 16 11.37Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17.5 6.5H17.51" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>

              {/* YouTube */}
              <Link to="#" className="w-12 h-12 rounded-full bg-[#718CF9] flex items-center justify-center hover:bg-[#5A70C7] transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.498 4.80824 21.0707 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92933 4.59318 2.50206 4.84824 2.16143 5.19941C1.82081 5.55057 1.57882 5.98541 1.46 6.46C1.14521 8.20556 0.991228 9.97631 1 11.75C0.988771 13.537 1.14277 15.3213 1.46 17.08C1.59096 17.5398 1.83835 17.9581 2.17823 18.2945C2.51812 18.6308 2.93884 18.8738 3.4 19C5.12 19.46 12 19.46 12 19.46C12 19.46 18.88 19.46 20.6 19C21.0707 18.8668 21.498 18.6118 21.8387 18.2606C22.1793 17.9094 22.4212 17.4746 22.54 17C22.8524 15.2676 23.0063 13.5103 23 11.75C23.0112 9.96295 22.8572 8.1787 22.54 6.42Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.75 15.02L15.5 11.75L9.75 8.48001V15.02Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
