// ============================================
// APPLICATION STATE & CONFIGURATION
// ============================================
const CONFIG = {
    progress: { html: { completed: 0, total: 5 }, css: { completed: 0, total: 5 }, overall: { completed: 0, total: 10 } },
    autoRefresh: true,
    lineNumbers: true,
    currentLesson: 'html-structure',
    userScores: {},
    version: '3.0.0'
};


// ============================================
// СИСТЕМА СОХРАНЕНИЯ ПРОГРЕССА
// Добавьте этот код в scriptLern.js
// ============================================

// Добавьте в начало файла, после CONFIG
const STORAGE_KEY = 'codecraft_user_progress';

// ============================================
// ФУНКЦИИ СОХРАНЕНИЯ И ЗАГРУЗКИ
// ============================================

/**
 * Сохранить весь прогресс пользователя
 */
function saveProgress(username) {
    const progressData = {
        username: username,
        lastAccessed: new Date().toISOString(),
        currentLesson: CONFIG.currentLesson,
        scores: CONFIG.userScores,
        completedLessons: getCompletedLessons(),
        htmlProgress: CONFIG.progress.html,
        cssProgress: CONFIG.progress.css,
        overallProgress: CONFIG.progress.overall,
        version: CONFIG.version
    };
    
    // Получаем все сохраненные прогрессы
    const allProgress = getAllProgress();
    
    // Обновляем прогресс текущего пользователя
    allProgress[username.toLowerCase()] = progressData;
    
    // Сохраняем обратно в localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    
    console.log(`✅ Progress saved for ${username}`);
}

/**
 * Загрузить прогресс пользователя
 */
function loadProgress(username) {
    const allProgress = getAllProgress();
    const userProgress = allProgress[username.toLowerCase()];
    
    if (userProgress) {
        // Восстанавливаем прогресс
        CONFIG.currentLesson = userProgress.currentLesson || 'html-structure';
        CONFIG.userScores = userProgress.scores || {};
        CONFIG.progress.html = userProgress.htmlProgress || { completed: 0, total: 5 };
        CONFIG.progress.css = userProgress.cssProgress || { completed: 0, total: 5 };
        CONFIG.progress.overall = userProgress.overallProgress || { completed: 0, total: 10 };
        
        // Восстанавливаем отметки о завершении уроков
        restoreCompletedLessons(userProgress.completedLessons || []);
        
        // Загружаем текущий урок
        loadLesson(CONFIG.currentLesson);
        updateProgress();
        
        console.log(`✅ Progress loaded for ${username}`);
        showToast(`Welcome back, ${username}! 👋`, 'success');
        
        return true;
    }
    
    return false;
}

/**
 * Получить все сохраненные прогрессы
 */
function getAllProgress() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}

/**
 * Получить список завершенных уроков
 */
function getCompletedLessons() {
    const completed = [];
    elements.lessonItems.forEach(item => {
        if (item.classList.contains('completed')) {
            completed.push(item.dataset.lesson);
        }
    });
    return completed;
}

/**
 * Восстановить отметки о завершенных уроках
 */
function restoreCompletedLessons(completedLessons) {
    elements.lessonItems.forEach(item => {
        const lessonId = item.dataset.lesson;
        if (completedLessons.includes(lessonId)) {
            item.classList.add('completed');
            const statusIcon = item.querySelector('.lesson-status i');
            if (statusIcon) statusIcon.className = 'fas fa-check-circle';
        }
    });
}

/**
 * Удалить прогресс пользователя
 */
function deleteProgress(username) {
    const allProgress = getAllProgress();
    delete allProgress[username.toLowerCase()];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    console.log(`🗑️ Progress deleted for ${username}`);
}

/**
 * Получить список всех пользователей
 */
function getAllUsers() {
    const allProgress = getAllProgress();
    return Object.keys(allProgress).map(key => ({
        username: allProgress[key].username,
        lastAccessed: allProgress[key].lastAccessed,
        progressPercentage: Math.round(
            (allProgress[key].overallProgress.completed / 
             allProgress[key].overallProgress.total) * 100
        )
    }));
}

// ============================================
// МОДАЛЬНОЕ ОКНО ДЛЯ ВХОДА
// ============================================

function showLoginModal() {
    // Проверяем, есть ли сохраненное имя
    const savedUsername = localStorage.getItem('codecraft_current_user');
    
    if (savedUsername) {
        // Автоматически загружаем последнего пользователя
        const loaded = loadProgress(savedUsername);
        if (loaded) {
            // Добавляем кнопку выхода
            addLogoutButton();
            return; // Выходим, не показываем модалку
        }
    }
    
    // Показываем модальное окно для входа
    const users = getAllUsers();
    let userListHTML = '';
    
    if (users.length > 0) {
        userListHTML = '<div class="saved-users"><h4>Saved Users:</h4><ul>';
        users.forEach(user => {
            userListHTML += `
                <li onclick="loadUserProgress('${user.username}')">
                    <strong>${user.username}</strong> - ${user.progressPercentage}% complete
                    <small>Last seen: ${new Date(user.lastAccessed).toLocaleDateString()}</small>
                </li>
            `;
        });
        userListHTML += '</ul></div>';
    }
    
    const modal = document.createElement('div');
    modal.className = 'login-modal';
    modal.innerHTML = `
        <div class="login-card">
            <h2>Welcome to CodeCraft! 👋</h2>
            <p>Enter your name to start learning or continue where you left off.</p>
            
            ${userListHTML}
            
            <form id="login-form">
                <input 
                    type="text" 
                    id="username-input" 
                    placeholder="Enter your name" 
                    required 
                    minlength="2"
                    autocomplete="off"
                />
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-sign-in-alt"></i>
                    Start Learning
                </button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Фокус на поле ввода
    setTimeout(() => {
        document.getElementById('username-input')?.focus();
    }, 300);
    
    // Обработчик формы
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username-input').value.trim();
        
        if (username.length >= 2) {
            localStorage.setItem('codecraft_current_user', username);
            
            // Загружаем или создаем новый прогресс
            const loaded = loadProgress(username);
            if (!loaded) {
                showToast(`Welcome, ${username}! Let's start learning! 🚀`, 'success');
                // Загружаем первый урок для нового пользователя
                loadLesson('html-structure');
            }
            
            // Добавляем кнопку выхода
            addLogoutButton();
            
            modal.remove();
        }
    });
}

// Глобальная функция для загрузки прогресса из списка
window.loadUserProgress = function(username) {
    localStorage.setItem('codecraft_current_user', username);
    loadProgress(username);
    addLogoutButton(); // Добавляем кнопку выхода
    document.querySelector('.login-modal')?.remove();
};

// ============================================
// АВТОСОХРАНЕНИЕ
// ============================================

// Сохранять прогресс при завершении урока
function markLessonCompletedWithSave(lessonId) {
    const lessonItem = document.querySelector(`[data-lesson="${lessonId}"]`);
    if (lessonItem && !lessonItem.classList.contains('completed')) {
        lessonItem.classList.add('completed');
        const statusIcon = lessonItem.querySelector('.lesson-status i');
        if (statusIcon) statusIcon.className = 'fas fa-check-circle';
        
        if (lessonId.startsWith('html')) {
            CONFIG.progress.html.completed++;
        } else if (lessonId.startsWith('css')) {
            CONFIG.progress.css.completed++;
        }
        CONFIG.progress.overall.completed++;
        updateProgress();
        
        // Автосохранение
        const currentUser = localStorage.getItem('codecraft_current_user');
        if (currentUser) {
            saveProgress(currentUser);
        }
    }
}

// Сохранять при смене урока
function loadLessonWithSave(lessonId) {
    const lesson = LESSONS[lessonId];
    if (!lesson) return;
    
    CONFIG.currentLesson = lessonId;
    currentHintIndex = 0;
    
    elements.lessonTitle.textContent = lesson.title;
    elements.lessonSubtitle.textContent = lesson.subtitle;
    elements.theoryContent.innerHTML = lesson.theory;
    
    editorContent = { ...lesson.initialCode };
    currentFile = 'html';
    loadCurrentFile();
    updateFileTabs();
    
    elements.lessonItems.forEach(item => {
        item.classList.toggle('active', item.dataset.lesson === lessonId);
    });
    
    const currentScore = CONFIG.userScores[lessonId] || '--';
    elements.lessonScore.textContent = currentScore === '--' ? '--' : `${currentScore}%`;
    
    if (window.innerWidth <= 992) {
        elements.sidebar.classList.add('collapsed');
    }
    
    setTimeout(runCode, 100);
    
    // Автосохранение
    const currentUser = localStorage.getItem('codecraft_current_user');
    if (currentUser) {
        saveProgress(currentUser);
    }
}

// ============================================
// ЗАМЕНИТЕ СТАРЫЕ ФУНКЦИИ
// ============================================

// Замените старую функцию markLessonCompleted на:
// markLessonCompleted = markLessonCompletedWithSave;

// Замените старую функцию loadLesson на:
// loadLesson = loadLessonWithSave;

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

// Добавьте в функцию initializeApp():
function initializeAppWithLogin() {
    // СНАЧАЛА инициализируем всё приложение
    updateProgress();
    initializeEventListeners();
    updateLineNumbers();
    
    // ПОТОМ показываем окно входа
    setTimeout(() => {
        showLoginModal();
    }, 100);
    
    // Автосохранение каждые 30 секунд
    setInterval(() => {
        const currentUser = localStorage.getItem('codecraft_current_user');
        if (currentUser) {
            saveProgress(currentUser);
        }
    }, 30000);
    
    // Добавляем кнопку выхода если пользователь залогинен
    const currentUser = localStorage.getItem('codecraft_current_user');
    if (currentUser) {
        setTimeout(addLogoutButton, 200);
    }
}

// Замените:
// document.addEventListener('DOMContentLoaded', initializeApp);
// На:
// document.addEventListener('DOMContentLoaded', initializeAppWithLogin);

// ============================================
// КНОПКА ВЫХОДА (опционально)
// ============================================

function addLogoutButton() {
    const headerActions = document.querySelector('.header-actions');
    const currentUser = localStorage.getItem('codecraft_current_user');
    
    // Проверяем, не добавлена ли уже кнопка
    if (document.getElementById('logout-btn')) {
        return;
    }
    
    if (currentUser && headerActions) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.className = 'btn btn-outline';
        logoutBtn.innerHTML = `
            <i class="fas fa-sign-out-alt"></i>
            ${currentUser}
        `;
        logoutBtn.onclick = () => {
            if (confirm(`Save progress for ${currentUser} and logout?`)) {
                saveProgress(currentUser);
                localStorage.removeItem('codecraft_current_user');
                location.reload();
            }
        };
        headerActions.appendChild(logoutBtn);
    }
}

// Вызовите после успешного входа
// addLogoutButton();

// ============================================
// ЗАМЕНИТЕ СТАРЫЕ ФУНКЦИИ
// ============================================

// Замените старую функцию markLessonCompleted на:
// markLessonCompleted = markLessonCompletedWithSave;

// Замените старую функцию loadLesson на:
// loadLesson = loadLessonWithSave;

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

// Добавьте в функцию initializeApp():
function initializeAppWithLogin() {
    // Показываем окно входа
    showLoginModal();
    
    updateProgress();
    initializeEventListeners();
    updateLineNumbers();
    
    // Автосохранение каждые 30 секунд
    setInterval(() => {
        const currentUser = localStorage.getItem('codecraft_current_user');
        if (currentUser) {
            saveProgress(currentUser);
        }
    }, 30000);
}

// Замените:
// document.addEventListener('DOMContentLoaded', initializeApp);
// На:
// document.addEventListener('DOMContentLoaded', initializeAppWithLogin);

// ============================================
// КНОПКА ВЫХОДА (опционально)
// ============================================

function addLogoutButton() {
    const headerActions = document.querySelector('.header-actions');
    const currentUser = localStorage.getItem('codecraft_current_user');
    
    if (currentUser && headerActions) {
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-outline';
        logoutBtn.innerHTML = `
            <i class="fas fa-sign-out-alt"></i>
            Logout (${currentUser})
        `;
        logoutBtn.onclick = () => {
            if (confirm('Save progress and logout?')) {
                saveProgress(currentUser);
                localStorage.removeItem('codecraft_current_user');
                location.reload();
            }
        };
        headerActions.appendChild(logoutBtn);
    }
}

// ============================================
// LESSONS DATA - 10 COMPLETE LESSONS
// ============================================
const LESSONS = {
    // ==========================================
    // LESSON 1: HTML Document Structure
    // ==========================================
'html-structure': {
    title: 'HTML Document Structure',
    subtitle: 'Learn the basic building blocks of every web page',
    difficulty: 'Beginner',
    duration: '15 minutes',
    theory: `
        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-rocket"></i></div>
                <h2 class="section-title">Welcome! Do you want to try some easy coding shtaff?</h2>
            </div>
            
            <p class="theory-text">Imagine you're writing a letter, but instead of paper, you're writing for a web browser, that's basically what HTML is - a way to tell your browser "hey, this is a title, this is a paragraph, this is important text." The browser reads your instructions and displays everything beautifully on the screen.</p>
            
            <p class="theory-text">Don't worry if this sounds complicated - it's actually much simpler than it seems. By the end of this lesson, you'll have created your very own web page. Yes, a real one that you can show to your friends!</p>
            
            <div class="tip-box">
                <div class="note-header">
                    <div class="note-icon tip-icon"><i class="fas fa-info-circle"></i></div>
                    <div class="note-title tip-title">Before We Start - Look at the Right Side of Your Screen</div>
                </div>
                <p class="theory-text">You see two boxes on the right? The top one is your <strong>Code Editor</strong> - this is where you'll type your code. The bottom one is <strong>Preview</strong> - this shows you what your web page looks like in real time. Every time you type something in the editor, the preview updates automatically. It's like magic, but it's just technology!</p>
            </div>
        </div>

        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-question-circle"></i></div>
                <h2 class="section-title">So What Exactly is HTML?</h2>
            </div>
            
            <p class="theory-text">HTML stands for <strong>HyperText Markup Language</strong>. Sounds scary? Let's break it down:</p>
            
            <p class="theory-text">Think of HTML like the skeleton of a human body. Just like bones give structure to your body, HTML gives structure to a web page. It tells the browser: "This part is the head of the page, this is the body, this text is a big title, this text is just a regular paragraph."</p>
            
            <p class="theory-text">Without HTML, a web page would just be a messy blob of text with no organization. HTML is what makes the internet actually readable and organized.</p>
        </div>

        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-tags"></i></div>
                <h2 class="section-title">The Building Blocks: Tags</h2>
            </div>
            
            <p class="theory-text">HTML uses something called <strong>tags</strong>. A tag is like a label that tells the browser what kind of content you're creating. Tags always look like this - they have angle brackets (these things: < >) around them.</p>
            
            <div class="code-block">
                <div class="code-block-header">
                    <div class="code-block-title"><i class="fas fa-code"></i> The Basic Pattern</div>
                    <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <pre><code>&lt;tagname&gt;Your content goes here&lt;/tagname&gt;</code></pre>
            </div>
            
            <p class="theory-text">See how there's an <strong>opening tag</strong> at the beginning and a <strong>closing tag</strong> at the end? The closing tag has a forward slash (/) before the tag name. This is super important - it's like opening and closing a door. You open it, put your content inside, then close it.</p>
            
            <div class="note-box">
                <div class="note-header">
                    <div class="note-icon"><i class="fas fa-lightbulb"></i></div>
                    <div class="note-title">The Golden Rule</div>
                </div>
                <p class="theory-text">If you open a tag, you <strong>must</strong> close it. Think of it like parentheses in math - every opening parenthesis needs a closing one. Open with <code>&lt;h1&gt;</code>, close with <code>&lt;/h1&gt;</code>. Forget to close it? Your page might look broken or weird. This is the #1 mistake beginners make, so always double-check!</p>
            </div>
        </div>

        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-heading"></i></div>
                <h2 class="section-title">The Four Tags You'll Learn Today</h2>
            </div>
            
            <p class="theory-text">We're going to use just four tags today. That's it - four! Let me introduce them:</p>
            
            <div class="code-block">
                <div class="code-block-header">
                    <div class="code-block-title"><i class="fas fa-list"></i> Meet Your New Friends</div>
                    <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <pre><code>&lt;title&gt;Page Title&lt;/title&gt;</code></pre>
            </div>
            <p class="theory-text"><strong>The Title Tag:</strong> This is what shows up in your browser tab - you know, that little text at the top of your browser window. It's also what Google shows when your page appears in search results. It's hidden on the actual page, but very important!</p>
            
            <div class="code-block">
                <div class="code-block-header">
                    <div class="code-block-title"><i class="fas fa-list"></i> The Big Heading</div>
                    <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <pre><code>&lt;h1&gt;Main Heading&lt;/h1&gt;</code></pre>
            </div>
            <p class="theory-text"><strong>The H1 Tag:</strong> This is your main headline - the biggest, most important text on your page. Think of it like the title of a newspaper article. You should only use ONE h1 per page. It's like having one main title for your story.</p>
            
            <div class="code-block">
                <div class="code-block-header">
                    <div class="code-block-title"><i class="fas fa-list"></i> The Subheading</div>
                    <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <pre><code>&lt;h2&gt;Subheading&lt;/h2&gt;</code></pre>
            </div>
            <p class="theory-text"><strong>The H2 Tag:</strong> This is a smaller heading, like a section title. If your page is a book, h1 is the book title and h2 are the chapter titles. You can have as many h2 tags as you want.</p>
            
            <div class="code-block">
                <div class="code-block-header">
                    <div class="code-block-title"><i class="fas fa-list"></i> The Paragraph</div>
                    <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <pre><code>&lt;p&gt;This is regular text.&lt;/p&gt;</code></pre>
            </div>
            <p class="theory-text"><strong>The P Tag:</strong> P stands for paragraph. This is your regular text - the stuff people actually read. Blog posts, descriptions, explanations - all of that goes inside p tags.</p>
        </div>

        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-eye"></i></div>
                <h2 class="section-title">What About All That Other Code in the Editor?</h2>
            </div>
            
            <p class="theory-text">If you look at the code editor on the right, you'll see a bunch of code already there. Don't panic! Most of it is just "setup code" that every web page needs. Let me quickly explain what you're seeing:</p>
            
            <p class="theory-text"><code>&lt;!DOCTYPE html&gt;</code> - This tells the browser "hey, this is an HTML document." Just leave it there.</p>
            
            <p class="theory-text"><code>&lt;html&gt;</code> - Everything on your page lives inside this tag. It's like the container for everything.</p>
            
            <p class="theory-text"><code>&lt;head&gt;</code> - This section contains invisible stuff - settings, the title, links to styles. Users don't see this part directly.</p>
            
            <p class="theory-text"><code>&lt;body&gt;</code> - This is where the magic happens! Everything you want people to SEE on your page goes in the body. This is where you'll be working today.</p>
            
            <div class="tip-box">
                <div class="note-header">
                    <div class="note-icon tip-icon"><i class="fas fa-hand-point-right"></i></div>
                    <div class="note-title tip-title">Focus Here</div>
                </div>
                <p class="theory-text">For this lesson, you only need to work inside the <code>&lt;body&gt;</code> section and change the <code>&lt;title&gt;</code>. That's it! Ignore everything else for now.</p>
            </div>
        </div>

        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-comment-dots"></i></div>
                <h2 class="section-title">One More Thing: Comments</h2>
            </div>
            
            <p class="theory-text">In the code editor, you'll see lines that look like this:</p>
            
            <div class="code-block">
                <div class="code-block-header">
                    <div class="code-block-title"><i class="fas fa-code"></i> This is a Comment</div>
                    <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <pre><code>&lt;!-- STEP 2: Add your h1 heading below this line --&gt;</code></pre>
            </div>
            
            <p class="theory-text">These are called <strong>comments</strong>. They're notes for humans - the browser completely ignores them. I've put comments in the code to show you exactly where to type each thing. Think of them like sticky notes saying "write here!"</p>
        </div>

        <div class="exercise-box">
            <div class="exercise-header">
                <div class="exercise-icon"><i class="fas fa-pencil-alt"></i></div>
                <div class="exercise-title">📝 Your Task: Create an "About Me" Page</div>
            </div>
            <p class="theory-text">Alright, enough reading - let's actually build something! You're going to create a simple "About Me" page. Follow these steps exactly, and watch the preview update as you type.</p>
        </div>

        <div class="step-by-step">
            <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>Change the Page Title</h4>
                    <p>Look at the code in the editor. Find this line (it's near the top, inside the &lt;head&gt; section):</p>
                    <div class="code-inline">&lt;title&gt;Change This Title&lt;/title&gt;</div>
                    <p>Change the text between the tags to say "My First Web Page". After you change it, it should look like this:</p>
                    <div class="code-inline">&lt;title&gt;My First Web Page&lt;/title&gt;</div>
                    <p><em>Note: You won't see this change in the preview - it shows up in the browser tab!</em></p>
                </div>
            </div>
            
            <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>Add Your Name as a Big Heading</h4>
                    <p>Now scroll down in the editor until you find this comment:</p>
                    <div class="code-inline">&lt;!-- STEP 2: Add your h1 heading below this line --&gt;</div>
                    <p>Right below that comment (on a new line), type an h1 tag with your name inside:</p>
                    <div class="code-inline">&lt;h1&gt;John Smith&lt;/h1&gt;</div>
                    <p><em>Obviously, use YOUR actual name instead of John Smith! You should see your name appear in big letters in the preview.</em></p>
                </div>
            </div>
            
            <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Add a Paragraph Introducing Yourself</h4>
                    <p>Find the comment that says STEP 3. Below it, add a paragraph about yourself:</p>
                    <div class="code-inline">&lt;p&gt;Hello! I am learning web development and this is my first web page.&lt;/p&gt;</div>
                    <p><em>Feel free to write whatever you want! Just make sure it starts with &lt;p&gt; and ends with &lt;/p&gt;</em></p>
                </div>
            </div>
            
            <div class="step">
                <div class="step-number">4</div>
                <div class="step-content">
                    <h4>Add a Section About Your Hobbies</h4>
                    <p>Find the STEP 4 comment. Add an h2 heading for a new section:</p>
                    <div class="code-inline">&lt;h2&gt;My Hobbies&lt;/h2&gt;</div>
                    <p><em>Notice this text will be smaller than your h1 name? That's because h2 is meant for section titles, not the main title.</em></p>
                </div>
            </div>
            
            <div class="step">
                <div class="step-number">5</div>
                <div class="step-content">
                    <h4>Add a Paragraph About Your Hobbies</h4>
                    <p>Finally, find the STEP 5 comment and add one more paragraph:</p>
                    <div class="code-inline">&lt;p&gt;I enjoy reading, playing video games, and learning new things.&lt;/p&gt;</div>
                    <p><em>Write about YOUR actual hobbies! Make it personal.</em></p>
                </div>
            </div>
        </div>

        <div class="tip-box" style="margin-top: 2rem;">
            <div class="note-header">
                <div class="note-icon tip-icon"><i class="fas fa-check-circle"></i></div>
                <div class="note-title tip-title">You're Almost Done!</div>
            </div>
            <p class="theory-text">Take a look at your preview - you should see your name as a big heading, a paragraph about yourself, a smaller "My Hobbies" heading, and another paragraph about your hobbies. If something looks wrong, check that all your tags are closed properly!</p>
            <p class="theory-text">When you're happy with it, click the green <strong>"Submit Solution"</strong> button at the bottom of the editor. The system will check if you did everything correctly. You need to pass all checks to complete the lesson. If something's wrong, it will tell you what to fix.</p>
        </div>

        <div class="note-box" style="margin-top: 1.5rem;">
            <div class="note-header">
                <div class="note-icon"><i class="fas fa-trophy"></i></div>
                <div class="note-title">Congratulations in Advance!</div>
            </div>
            <p class="theory-text">Once you complete this, you'll have created your first real web page. That's a huge deal! Every professional web developer started exactly where you are right now. The journey of a thousand websites begins with a single &lt;h1&gt; tag. 😊</p>
        </div>
    `,
    initialCode: {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change This Title</title>
</head>
<body>

    <!-- STEP 2: Add your h1 heading below this line -->
    
    
    <!-- STEP 3: Add your introduction paragraph below -->
    
    
    <!-- STEP 4: Add your h2 subheading below -->
    
    
    <!-- STEP 5: Add your hobbies paragraph below -->
    

</body>
</html>`,
        css: `/* CSS is pre-written for you - just focus on HTML! */
body {
    font-family: 'Segoe UI', Arial, sans-serif;
    max-width: 700px;
    margin: 50px auto;
    padding: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}
h1 {
    color: white;
    font-size: 2.5rem;
    margin-bottom: 10px;
}
h2 {
    color: rgba(255,255,255,0.9);
    font-size: 1.5rem;
    margin-top: 30px;
    border-bottom: 2px solid rgba(255,255,255,0.3);
    padding-bottom: 10px;
}
p {
    color: rgba(255,255,255,0.85);
    font-size: 1.1rem;
    line-height: 1.8;
}`,
        js: `// No JavaScript needed for this lesson`
    },
    hints: [
        "💡 Step 1: Find <title>Change This Title</title> and replace 'Change This Title' with 'My First Web Page'",
        "💡 Step 2: Type <h1>Your Name</h1> right below the <!-- STEP 2 --> comment",
        "💡 Step 3: Type <p>Your introduction text</p> below <!-- STEP 3 -->",
        "💡 Step 4: Type <h2>My Hobbies</h2> below <!-- STEP 4 -->",
        "💡 Step 5: Type <p>Your hobbies here</p> below <!-- STEP 5 -->",
        "💡 Make sure every tag is closed! <h1>text</h1> not <h1>text"
    ],
    validation: (code) => {
        const checks = [];
        checks.push({ 
            passed: code.html.includes('<title>My First Web Page</title>'), 
            message: '✓ Title changed to "My First Web Page"' 
        });
        checks.push({ 
            passed: /<h1>[\s\S]+<\/h1>/i.test(code.html), 
            message: '✓ Added h1 heading with your name' 
        });
        checks.push({ 
            passed: (code.html.match(/<p>[\s\S]*?<\/p>/gi) || []).length >= 2, 
            message: '✓ Added two paragraphs' 
        });
        checks.push({ 
            passed: /<h2>[\s\S]*<\/h2>/i.test(code.html), 
            message: '✓ Added h2 subheading' 
        });
        return checks;
    }
},


    // ==========================================
    // LESSON 2: HTML Elements & Tags
    // ==========================================
'html-elements': {
    title: 'Lists and Text Formatting',
    subtitle: 'Learn to create bullet lists, numbered lists, and format text',
    difficulty: 'Beginner',
    duration: '20 minutes',
    theory: `
        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-list"></i></div>
                <h2 class="section-title">Why Do We Need Lists?</h2>
            </div>
            
            <p class="theory-text">Think about the last time you wrote a shopping list or a to-do list. You probably wrote items one below another, maybe with bullet points or numbers. It's organized, easy to read, and you can quickly see each item. That's exactly what HTML lists do for web pages!</p>
            
            <p class="theory-text">Without lists, you'd have to write everything in paragraphs like "I need to buy milk and eggs and bread and cheese and..." - that's hard to read! Lists make information clear and scannable. They're everywhere on the internet - recipe ingredients, navigation menus, feature lists, step-by-step instructions, you name it.</p>
            
            <p class="theory-text">In this lesson, you'll learn how to create two types of lists and how to make text <strong>bold</strong> or <em>italic</em>. By the end, you'll build a complete recipe page!</p>
        </div>

        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-circle"></i></div>
                <h2 class="section-title">Bullet Lists (Unordered Lists)</h2>
            </div>
            
            <p class="theory-text">A bullet list is what you use when the order doesn't matter. Shopping list? Bullet points. List of your favorite movies? Bullet points. Features of a product? Bullet points.</p>
            
            <p class="theory-text">In HTML, we call this an <strong>unordered list</strong>, and we use the tag <code>&lt;ul&gt;</code> (ul = unordered list). But here's the thing - the <code>&lt;ul&gt;</code> tag is just the container. Each actual item in the list needs its own tag: <code>&lt;li&gt;</code> (li = list item).</p>
            
            <p class="theory-text">Think of it like a box and things inside the box. The <code>&lt;ul&gt;</code> is the box, and each <code>&lt;li&gt;</code> is something you put inside.</p>
            
            <div class="code-block">
                <div class="code-block-header">
                    <div class="code-block-title"><i class="fas fa-code"></i> Bullet List Example</div>
                    <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <pre><code>&lt;ul&gt;
    &lt;li&gt;Apples&lt;/li&gt;
    &lt;li&gt;Bananas&lt;/li&gt;
    &lt;li&gt;Oranges&lt;/li&gt;
&lt;/ul&gt;</code></pre>
            </div>
            
            <p class="theory-text">Let me break this down line by line:</p>
            <p class="theory-text">• <code>&lt;ul&gt;</code> — "Hey browser, I'm starting a bullet list!"</p>
            <p class="theory-text">• <code>&lt;li&gt;Apples&lt;/li&gt;</code> — "Here's the first item: Apples"</p>
            <p class="theory-text">• <code>&lt;li&gt;Bananas&lt;/li&gt;</code> — "Here's another item: Bananas"</p>
            <p class="theory-text">• <code>&lt;li&gt;Oranges&lt;/li&gt;</code> — "And another: Oranges"</p>
            <p class="theory-text">• <code>&lt;/ul&gt;</code> — "Okay, that's the end of my list!"</p>
            
            <div class="result-preview">
                <strong>This creates:</strong>
                <ul style="margin: 10px 0 0 20px; color: var(--text-secondary);">
                    <li>Apples</li>
                    <li>Bananas</li>
                    <li>Oranges</li>
                </ul>
            </div>
            
            <div class="note-box">
                <div class="note-header">
                    <div class="note-icon"><i class="fas fa-lightbulb"></i></div>
                    <div class="note-title">Common Mistake Alert!</div>
                </div>
                <p class="theory-text">Don't forget to close BOTH tags! You need <code>&lt;/li&gt;</code> after each item AND <code>&lt;/ul&gt;</code> at the very end. Missing any of these will break your list.</p>
            </div>
        </div>

        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-list-ol"></i></div>
                <h2 class="section-title">Numbered Lists (Ordered Lists)</h2>
            </div>
            
            <p class="theory-text">Sometimes order DOES matter. If you're writing a recipe, you can't just randomly do steps - you need to preheat the oven BEFORE you put the food in, right? Or if you're explaining how to do something, step 1 has to come before step 2.</p>
            
            <p class="theory-text">For these situations, we use an <strong>ordered list</strong> with the tag <code>&lt;ol&gt;</code> (ol = ordered list). The cool thing? The browser automatically adds the numbers for you! You don't have to type "1.", "2.", "3." - it just happens.</p>
            
            <div class="code-block">
                <div class="code-block-header">
                    <div class="code-block-title"><i class="fas fa-code"></i> Numbered List Example</div>
                    <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <pre><code>&lt;ol&gt;
    &lt;li&gt;Preheat oven to 350°F&lt;/li&gt;
    &lt;li&gt;Mix all ingredients in a bowl&lt;/li&gt;
    &lt;li&gt;Pour into baking pan&lt;/li&gt;
    &lt;li&gt;Bake for 25 minutes&lt;/li&gt;
&lt;/ol&gt;</code></pre>
            </div>
            
            <p class="theory-text">Notice something? The inside is exactly the same! You still use <code>&lt;li&gt;</code> for each item. The only difference is the outer tag: <code>&lt;ol&gt;</code> instead of <code>&lt;ul&gt;</code>.</p>
            
            <div class="result-preview">
                <strong>This creates:</strong>
                <ol style="margin: 10px 0 0 20px; color: var(--text-secondary);">
                    <li>Preheat oven to 350°F</li>
                    <li>Mix all ingredients in a bowl</li>
                    <li>Pour into baking pan</li>
                    <li>Bake for 25 minutes</li>
                </ol>
            </div>
            
            <div class="tip-box">
                <div class="note-header">
                    <div class="note-icon tip-icon"><i class="fas fa-info-circle"></i></div>
                    <div class="note-title tip-title">Quick Summary</div>
                </div>
                <p class="theory-text"><code>&lt;ul&gt;</code> = bullets (unordered) — use when order doesn't matter</p>
                <p class="theory-text"><code>&lt;ol&gt;</code> = numbers (ordered) — use when order matters</p>
                <p class="theory-text"><code>&lt;li&gt;</code> = each item — used inside BOTH types of lists</p>
            </div>
        </div>

        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-bold"></i></div>
                <h2 class="section-title">Making Text Bold and Italic</h2>
            </div>
            
            <p class="theory-text">Sometimes you want to emphasize certain words. Maybe you want to say "This cake is AMAZING" and really make that word pop. In HTML, we have special tags for this.</p>
            
            <p class="theory-text">For <strong>bold text</strong>, we use the <code>&lt;strong&gt;</code> tag. It's called "strong" because you're making the text strongly emphasized - it's important!</p>
            
            <div class="code-block">
                <div class="code-block-header">
                    <div class="code-block-title"><i class="fas fa-code"></i> Bold Text</div>
                    <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <pre><code>&lt;p&gt;This cake is &lt;strong&gt;amazing&lt;/strong&gt; and you should try it!&lt;/p&gt;</code></pre>
            </div>
            
            <p class="theory-text">This shows: This cake is <strong>amazing</strong> and you should try it!</p>
            
            <p class="theory-text">For <em>italic text</em>, we use the <code>&lt;em&gt;</code> tag. "Em" stands for emphasis - it's like when you stress a word while speaking.</p>
            
            <div class="code-block">
                <div class="code-block-header">
                    <div class="code-block-title"><i class="fas fa-code"></i> Italic Text</div>
                    <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <pre><code>&lt;p&gt;You &lt;em&gt;really&lt;/em&gt; need to try this recipe.&lt;/p&gt;</code></pre>
            </div>
            
            <p class="theory-text">This shows: You <em>really</em> need to try this recipe.</p>
            
            <div class="note-box">
                <div class="note-header">
                    <div class="note-icon"><i class="fas fa-lightbulb"></i></div>
                    <div class="note-title">How It Works</div>
                </div>
                <p class="theory-text">Notice that <code>&lt;strong&gt;</code> and <code>&lt;em&gt;</code> go INSIDE your paragraph tags. You're not replacing the <code>&lt;p&gt;</code> tag - you're adding formatting to specific words within it. It's like highlighting certain words in a sentence you've already written.</p>
            </div>
        </div>

        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-layer-group"></i></div>
                <h2 class="section-title">Putting It All Together</h2>
            </div>
            
            <p class="theory-text">Now you know headings (from lesson 1), paragraphs, lists, and text formatting. That's actually enough to build a lot of real web content! A typical recipe page uses ALL of these:</p>
            
            <p class="theory-text">• <code>&lt;h1&gt;</code> for the recipe name</p>
            <p class="theory-text">• <code>&lt;p&gt;</code> with <code>&lt;strong&gt;</code> for a tasty description</p>
            <p class="theory-text">• <code>&lt;h2&gt;</code> for "Ingredients" section title</p>
            <p class="theory-text">• <code>&lt;ul&gt;</code> with <code>&lt;li&gt;</code> items for the ingredient list</p>
            <p class="theory-text">• <code>&lt;h2&gt;</code> for "Instructions" section title</p>
            <p class="theory-text">• <code>&lt;ol&gt;</code> with <code>&lt;li&gt;</code> items for the cooking steps</p>
            
            <p class="theory-text">See how it all connects? You're not just learning random tags - you're learning how to structure real content!</p>
        </div>

        <div class="exercise-box">
            <div class="exercise-header">
                <div class="exercise-icon"><i class="fas fa-pencil-alt"></i></div>
                <div class="exercise-title">📝 Your Task: Create a Recipe Page</div>
            </div>
            <p class="theory-text">Time to cook up some code! You're going to create a complete recipe page. It can be any recipe you like - cookies, pasta, a sandwich, whatever! Just follow the structure below.</p>
        </div>

        <div class="step-by-step">
            <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>Add the Recipe Title</h4>
                    <p>Find <code>&lt;!-- STEP 1 --&gt;</code> in the editor and add a big heading with your recipe name:</p>
                    <div class="code-inline">&lt;h1&gt;Chocolate Chip Cookies&lt;/h1&gt;</div>
                    <p><em>Pick any recipe you want! Pizza, pancakes, smoothie - anything works.</em></p>
                </div>
            </div>
            
            <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>Add a Tasty Description with Bold Text</h4>
                    <p>Find <code>&lt;!-- STEP 2 --&gt;</code> and add a paragraph that describes your recipe. Make at least one word bold using <code>&lt;strong&gt;</code>:</p>
                    <div class="code-inline">&lt;p&gt;These &lt;strong&gt;delicious&lt;/strong&gt; cookies are perfect for any occasion!&lt;/p&gt;</div>
                    <p><em>The word "delicious" will appear in bold. You can make any word bold - "amazing", "easy", "homemade" - whatever fits!</em></p>
                </div>
            </div>
            
            <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Add "Ingredients" Section Heading</h4>
                    <p>Find <code>&lt;!-- STEP 3 --&gt;</code> and add a subheading for the ingredients section:</p>
                    <div class="code-inline">&lt;h2&gt;Ingredients&lt;/h2&gt;</div>
                </div>
            </div>
            
            <div class="step">
                <div class="step-number">4</div>
                <div class="step-content">
                    <h4>Create a Bullet List of Ingredients</h4>
                    <p>Find <code>&lt;!-- STEP 4 --&gt;</code>. This is where it gets fun! Create an unordered list with at least 4 ingredients:</p>
                    <div class="code-inline">&lt;ul&gt;
    &lt;li&gt;2 cups flour&lt;/li&gt;
    &lt;li&gt;1 cup sugar&lt;/li&gt;
    &lt;li&gt;1 cup butter&lt;/li&gt;
    &lt;li&gt;2 cups chocolate chips&lt;/li&gt;
&lt;/ul&gt;</div>
                    <p><em>Remember: start with &lt;ul&gt;, then each ingredient gets its own &lt;li&gt;...&lt;/li&gt;, then close with &lt;/ul&gt;. Add as many ingredients as you want!</em></p>
                </div>
            </div>
            
            <div class="step">
                <div class="step-number">5</div>
                <div class="step-content">
                    <h4>Add "Instructions" Section Heading</h4>
                    <p>Find <code>&lt;!-- STEP 5 --&gt;</code> and add another subheading:</p>
                    <div class="code-inline">&lt;h2&gt;Instructions&lt;/h2&gt;</div>
                </div>
            </div>
            
            <div class="step">
                <div class="step-number">6</div>
                <div class="step-content">
                    <h4>Create a Numbered List of Steps</h4>
                    <p>Find <code>&lt;!-- STEP 6 --&gt;</code>. Now create an ordered list with at least 3 cooking steps:</p>
                    <div class="code-inline">&lt;ol&gt;
    &lt;li&gt;Preheat oven to 375°F&lt;/li&gt;
    &lt;li&gt;Mix all ingredients together in a large bowl&lt;/li&gt;
    &lt;li&gt;Scoop onto baking sheet and bake for 10 minutes&lt;/li&gt;
&lt;/ol&gt;</div>
                    <p><em>Same idea as before, but use &lt;ol&gt; instead of &lt;ul&gt;. The browser will automatically number your steps 1, 2, 3...</em></p>
                </div>
            </div>
        </div>

        <div class="tip-box" style="margin-top: 2rem;">
            <div class="note-header">
                <div class="note-icon tip-icon"><i class="fas fa-check-circle"></i></div>
                <div class="note-title tip-title">Check Your Work</div>
            </div>
            <p class="theory-text">Before you hit Submit, look at the preview and make sure you see:</p>
            <p class="theory-text">✓ A big recipe title at the top</p>
            <p class="theory-text">✓ A description with at least one bold word</p>
            <p class="theory-text">✓ "Ingredients" heading with bullet points below it</p>
            <p class="theory-text">✓ "Instructions" heading with numbered steps below it</p>
            <p class="theory-text">If something looks off, check your opening and closing tags!</p>
        </div>

        <div class="note-box" style="margin-top: 1.5rem;">
            <div class="note-header">
                <div class="note-icon"><i class="fas fa-trophy"></i></div>
                <div class="note-title">Nice Work!</div>
            </div>
            <p class="theory-text">After this lesson, you'll have created something that looks like a real web page! Recipe sites, how-to guides, product pages - they all use exactly what you just learned. These building blocks are the foundation of almost every website you visit. Keep going! 🚀</p>
        </div>
    `,
    initialCode: {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Recipe</title>
</head>
<body>

    <!-- STEP 1: Add recipe title (h1) below -->
    
    
    <!-- STEP 2: Add description paragraph with bold text below -->
    
    
    <!-- STEP 3: Add "Ingredients" heading (h2) below -->
    
    
    <!-- STEP 4: Add bullet list (ul) with ingredients below -->
    
    
    <!-- STEP 5: Add "Instructions" heading (h2) below -->
    
    
    <!-- STEP 6: Add numbered list (ol) with steps below -->
    

</body>
</html>`,
        css: `body {
    font-family: Georgia, serif;
    max-width: 650px;
    margin: 0 auto;
    padding: 40px 30px;
    background: #fffaf0;
    line-height: 1.8;
}
h1 {
    color: #8b4513;
    font-size: 2.2rem;
    border-bottom: 3px solid #d2691e;
    padding-bottom: 15px;
}
h2 {
    color: #a0522d;
    margin-top: 35px;
    font-size: 1.4rem;
}
p { color: #5d4037; font-size: 1.1rem; }
ul, ol {
    background: #fff8dc;
    padding: 20px 40px;
    border-radius: 10px;
    border: 1px solid #deb887;
}
li {
    padding: 8px 0;
    color: #6d4c41;
}
strong { color: #d2691e; }`,
        js: `// No JavaScript needed`
    },
    hints: [
        "💡 Step 1: Type <h1>Your Recipe Name</h1> - pick any food you like!",
        "💡 Step 2: Write a <p> paragraph and put <strong>one word</strong> in strong tags for bold",
        "💡 Step 3: Type <h2>Ingredients</h2>",
        "💡 Step 4: Start with <ul>, add <li>item</li> for each ingredient (at least 4!), end with </ul>",
        "💡 Step 5: Type <h2>Instructions</h2>",
        "💡 Step 6: Same as step 4, but use <ol> instead of <ul> for numbered steps"
    ],
    validation: (code) => {
        const checks = [];
        checks.push({ passed: /<h1>[\s\S]+<\/h1>/i.test(code.html), message: '✓ Added recipe title (h1)' });
        checks.push({ passed: /<strong>[\s\S]+<\/strong>/i.test(code.html), message: '✓ Used bold text (<strong>)' });
        checks.push({ passed: (code.html.match(/<h2>/gi) || []).length >= 2, message: '✓ Added two h2 headings' });
        checks.push({ passed: /<ul>[\s\S]*<li>[\s\S]*<\/li>[\s\S]*<\/ul>/i.test(code.html), message: '✓ Added bullet list (ul)' });
        checks.push({ passed: /<ol>[\s\S]*<li>[\s\S]*<\/li>[\s\S]*<\/ol>/i.test(code.html), message: '✓ Added numbered list (ol)' });
        checks.push({ passed: (code.html.match(/<li>/gi) || []).length >= 7, message: '✓ Added at least 7 list items total' });
        return checks;
    }
},

    // ==========================================
    // LESSON 3: Links & Images
    // ==========================================
    'html-links-images': {
        title: 'Links and Images',
        subtitle: 'Add clickable links and images to make your pages interactive',
        difficulty: 'Beginner',
        duration: '20 minutes',
        theory: `
            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-link"></i></div>
                    <h2 class="section-title">Creating Links</h2>
                </div>
                <p class="theory-text">Links let users click to go to other pages. They use the <code>&lt;a&gt;</code> tag (a = anchor):</p>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Link Syntax</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>&lt;a href="https://google.com"&gt;Click here to visit Google&lt;/a&gt;</code></pre>
                </div>
                
                <div class="note-box">
                    <div class="note-header">
                        <div class="note-icon"><i class="fas fa-lightbulb"></i></div>
                        <div class="note-title">Understanding the Parts</div>
                    </div>
                    <ul class="theory-list">
                        <li><code>&lt;a&gt;</code> - The link tag</li>
                        <li><code>href="..."</code> - Where the link goes (the URL)</li>
                        <li>The text between tags - What users see and click</li>
                    </ul>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Open Link in New Tab</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>&lt;a href="https://google.com" target="_blank"&gt;Opens in new tab&lt;/a&gt;</code></pre>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-image"></i></div>
                    <h2 class="section-title">Adding Images</h2>
                </div>
                <p class="theory-text">Images use the <code>&lt;img&gt;</code> tag. Unlike other tags, it doesn't need a closing tag!</p>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Image Syntax</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>&lt;img src="https://picsum.photos/300/200" alt="A random photo"&gt;</code></pre>
                </div>
                
                <div class="note-box">
                    <div class="note-header">
                        <div class="note-icon"><i class="fas fa-lightbulb"></i></div>
                        <div class="note-title">Important Attributes</div>
                    </div>
                    <ul class="theory-list">
                        <li><code>src="..."</code> - The image URL (where the image is located)</li>
                        <li><code>alt="..."</code> - Description for screen readers (always include this!)</li>
                    </ul>
                </div>
                
                <div class="tip-box">
                    <div class="note-header">
                        <div class="note-icon tip-icon"><i class="fas fa-camera"></i></div>
                        <div class="note-title tip-title">Free Images for Practice</div>
                    </div>
                    <p class="theory-text">Use <code>https://picsum.photos/300/200</code> to get random photos. Change the numbers to change size (width/height).</p>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-envelope"></i></div>
                    <h2 class="section-title">Email Links</h2>
                </div>
                <p class="theory-text">Create a link that opens the user's email app:</p>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Email Link</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>&lt;a href="mailto:hello@example.com"&gt;Send me an email&lt;/a&gt;</code></pre>
                </div>
            </div>

            <div class="exercise-box">
                <div class="exercise-header">
                    <div class="exercise-icon"><i class="fas fa-pencil-alt"></i></div>
                    <div class="exercise-title">📝 Your Task: Create a Profile Card</div>
                </div>
                <p class="theory-text">Build a profile card with an image, some text, and social links.</p>
            </div>

            <div class="step-by-step">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Add a Profile Image</h4>
                        <p>Find <code>&lt;!-- STEP 1 --&gt;</code> and add:</p>
                        <div class="code-inline">&lt;img src="https://picsum.photos/150" alt="Profile photo"&gt;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Add Your Name</h4>
                        <p>Find <code>&lt;!-- STEP 2 --&gt;</code> and add:</p>
                        <div class="code-inline">&lt;h1&gt;Alex Johnson&lt;/h1&gt;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Add a Short Bio</h4>
                        <p>Find <code>&lt;!-- STEP 3 --&gt;</code> and add:</p>
                        <div class="code-inline">&lt;p&gt;Web developer who loves creating beautiful websites.&lt;/p&gt;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h4>Add a Website Link</h4>
                        <p>Find <code>&lt;!-- STEP 4 --&gt;</code> and add a link (use any URL you want):</p>
                        <div class="code-inline">&lt;a href="https://github.com"&gt;My GitHub&lt;/a&gt;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">5</div>
                    <div class="step-content">
                        <h4>Add an Email Link</h4>
                        <p>Find <code>&lt;!-- STEP 5 --&gt;</code> and add:</p>
                        <div class="code-inline">&lt;a href="mailto:hello@example.com"&gt;Contact Me&lt;/a&gt;</div>
                    </div>
                </div>
            </div>
        `,
        initialCode: {
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile</title>
</head>
<body>
    <div class="card">
    
        <!-- STEP 1: Add profile image below -->
        
        
        <!-- STEP 2: Add your name (h1) below -->
        
        
        <!-- STEP 3: Add a short bio paragraph below -->
        
        
        <div class="links">
            <!-- STEP 4: Add a website link below -->
            
            
            <!-- STEP 5: Add an email link below -->
            
        </div>
        
    </div>
</body>
</html>`,
            css: `body {
    font-family: 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}
.card {
    background: white;
    border-radius: 20px;
    padding: 40px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    max-width: 350px;
    width: 100%;
}
.card img {
    border-radius: 50%;
    border: 4px solid #667eea;
    width: 150px;
    height: 150px;
    object-fit: cover;
}
.card h1 {
    color: #333;
    margin: 20px 0 10px;
    font-size: 1.8rem;
}
.card p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 25px;
}
.links {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
}
.links a {
    display: inline-block;
    padding: 12px 25px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    text-decoration: none;
    border-radius: 25px;
    font-weight: 500;
    transition: transform 0.2s, box-shadow 0.2s;
}
.links a:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}`,
            js: `// No JavaScript needed`
        },
        hints: [
            "💡 Step 1: Type <img src=\"https://picsum.photos/150\" alt=\"Profile photo\">",
            "💡 Step 2: Type <h1>Your Name</h1>",
            "💡 Step 3: Type <p>A sentence about yourself</p>",
            "💡 Step 4: Type <a href=\"https://anywebsite.com\">Link Text</a>",
            "💡 Step 5: Use mailto: in href: <a href=\"mailto:email@example.com\">Contact Me</a>"
        ],
        validation: (code) => {
            const checks = [];
            checks.push({ passed: /<img[^>]+src=["'][^"']+["'][^>]*>/i.test(code.html), message: '✓ Added an image with src' });
            checks.push({ passed: /<img[^>]+alt=["'][^"']+["'][^>]*>/i.test(code.html), message: '✓ Image has alt text' });
            checks.push({ passed: /<h1>[\s\S]+<\/h1>/i.test(code.html), message: '✓ Added name heading' });
            checks.push({ passed: (code.html.match(/<a[^>]+href=/gi) || []).length >= 2, message: '✓ Added at least 2 links' });
            checks.push({ passed: /mailto:/i.test(code.html), message: '✓ Added an email link (mailto:)' });
            return checks;
        }
    },

    // ==========================================
    // LESSON 4: Semantic HTML
    // ==========================================
    'html-semantic': {
        title: 'Page Layout with Semantic HTML',
        subtitle: 'Structure your page properly with header, nav, main, and footer',
        difficulty: 'Beginner',
        duration: '25 minutes',
        theory: `
            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-sitemap"></i></div>
                    <h2 class="section-title">What is Semantic HTML?</h2>
                </div>
                <p class="theory-text"><strong>Semantic HTML</strong> means using tags that describe their content. Instead of using <code>&lt;div&gt;</code> for everything, we use descriptive tags like <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, and <code>&lt;footer&gt;</code>.</p>
                
                <div class="tip-box">
                    <div class="note-header">
                        <div class="note-icon tip-icon"><i class="fas fa-question-circle"></i></div>
                        <div class="note-title tip-title">Why Does This Matter?</div>
                    </div>
                    <ul class="theory-list">
                        <li><strong>Accessibility:</strong> Screen readers understand your page structure</li>
                        <li><strong>SEO:</strong> Search engines rank your content better</li>
                        <li><strong>Readability:</strong> Your code is easier to understand</li>
                    </ul>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-th-large"></i></div>
                    <h2 class="section-title">The Main Semantic Tags</h2>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Page Structure</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>&lt;body&gt;
    &lt;header&gt;
        Logo and navigation go here
    &lt;/header&gt;
    
    &lt;main&gt;
        Main content goes here
    &lt;/main&gt;
    
    &lt;footer&gt;
        Copyright info goes here
    &lt;/footer&gt;
&lt;/body&gt;</code></pre>
                </div>
                
                <div class="note-box">
                    <div class="note-header">
                        <div class="note-icon"><i class="fas fa-lightbulb"></i></div>
                        <div class="note-title">What Each Tag Means</div>
                    </div>
                    <ul class="theory-list">
                        <li><code>&lt;header&gt;</code> - Top of page (logo, site title, navigation)</li>
                        <li><code>&lt;nav&gt;</code> - Navigation links</li>
                        <li><code>&lt;main&gt;</code> - Main content (use only once per page!)</li>
                        <li><code>&lt;article&gt;</code> - Self-contained content (like a blog post)</li>
                        <li><code>&lt;footer&gt;</code> - Bottom of page (copyright, contact info)</li>
                    </ul>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-compass"></i></div>
                    <h2 class="section-title">Navigation Example</h2>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Nav with Links</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>&lt;nav&gt;
    &lt;a href="#home"&gt;Home&lt;/a&gt;
    &lt;a href="#about"&gt;About&lt;/a&gt;
    &lt;a href="#contact"&gt;Contact&lt;/a&gt;
&lt;/nav&gt;</code></pre>
                </div>
            </div>

            <div class="exercise-box">
                <div class="exercise-header">
                    <div class="exercise-icon"><i class="fas fa-pencil-alt"></i></div>
                    <div class="exercise-title">📝 Your Task: Build a Complete Page Layout</div>
                </div>
                <p class="theory-text">Create a properly structured page with header, navigation, main content, and footer.</p>
            </div>

            <div class="step-by-step">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Create the Header with Site Title</h4>
                        <p>Find <code>&lt;!-- STEP 1 --&gt;</code> and add:</p>
                        <div class="code-inline">&lt;header&gt;
    &lt;h1&gt;My Awesome Website&lt;/h1&gt;
&lt;/header&gt;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Add Navigation Inside the Header</h4>
                        <p>Inside your header (after h1), add:</p>
                        <div class="code-inline">&lt;nav&gt;
    &lt;a href="#home"&gt;Home&lt;/a&gt;
    &lt;a href="#about"&gt;About&lt;/a&gt;
    &lt;a href="#contact"&gt;Contact&lt;/a&gt;
&lt;/nav&gt;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Add the Main Content Area</h4>
                        <p>Find <code>&lt;!-- STEP 3 --&gt;</code> and add main with an article inside:</p>
                        <div class="code-inline">&lt;main&gt;
    &lt;article&gt;
        &lt;h2&gt;Welcome!&lt;/h2&gt;
        &lt;p&gt;This is my website. I'm learning HTML!&lt;/p&gt;
    &lt;/article&gt;
&lt;/main&gt;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h4>Add the Footer</h4>
                        <p>Find <code>&lt;!-- STEP 4 --&gt;</code> and add:</p>
                        <div class="code-inline">&lt;footer&gt;
    &lt;p&gt;© 2024 My Website. All rights reserved.&lt;/p&gt;
&lt;/footer&gt;</div>
                    </div>
                </div>
            </div>
        `,
        initialCode: {
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
</head>
<body>

    <!-- STEP 1 & 2: Add header with h1 and nav below -->
    
    
    
    <!-- STEP 3: Add main with article below -->
    
    
    
    <!-- STEP 4: Add footer below -->
    
    

</body>
</html>`,
            css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: #333;
}
header {
    background: linear-gradient(135deg, #2c3e50, #3498db);
    color: white;
    padding: 20px 40px;
}
header h1 {
    font-size: 1.8rem;
    margin-bottom: 15px;
}
nav {
    display: flex;
    gap: 20px;
}
nav a {
    color: rgba(255,255,255,0.9);
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 5px;
    transition: background 0.3s;
}
nav a:hover {
    background: rgba(255,255,255,0.2);
}
main {
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;
}
article {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}
article h2 {
    color: #2c3e50;
    margin-bottom: 15px;
}
article p {
    color: #666;
}
footer {
    background: #2c3e50;
    color: rgba(255,255,255,0.8);
    text-align: center;
    padding: 25px;
    margin-top: 40px;
}`,
            js: `// No JavaScript needed`
        },
        hints: [
            "💡 Step 1: Start with <header> tag, put <h1> inside it, then close with </header>",
            "💡 Step 2: Add <nav> with 3 links INSIDE the header, before </header>",
            "💡 Step 3: Create <main> tag, put <article> inside with h2 and p",
            "💡 Step 4: Add <footer> with a paragraph inside",
            "💡 Make sure main and footer are OUTSIDE the header tag!"
        ],
        validation: (code) => {
            const checks = [];
            checks.push({ passed: /<header>[\s\S]*<\/header>/i.test(code.html), message: '✓ Added header element' });
            checks.push({ passed: /<nav>[\s\S]*<a[\s\S]*<\/nav>/i.test(code.html), message: '✓ Added nav with links' });
            checks.push({ passed: /<main>[\s\S]*<\/main>/i.test(code.html), message: '✓ Added main element' });
            checks.push({ passed: /<article>[\s\S]*<\/article>/i.test(code.html), message: '✓ Added article element' });
            checks.push({ passed: /<footer>[\s\S]*<\/footer>/i.test(code.html), message: '✓ Added footer element' });
            return checks;
        }
    },

    // ==========================================
    // LESSON 5: Forms & Inputs
    // ==========================================
    'html-forms': {
        title: 'Creating Forms',
        subtitle: 'Build interactive forms with text inputs, checkboxes, and buttons',
        difficulty: 'Intermediate',
        duration: '25 minutes',
        theory: `
            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-wpforms"></i></div>
                    <h2 class="section-title">What Are Forms?</h2>
                </div>
                <p class="theory-text">Forms let users enter information - like login pages, contact forms, or search boxes. Every form needs the <code>&lt;form&gt;</code> tag to wrap its contents.</p>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-keyboard"></i></div>
                    <h2 class="section-title">Text Inputs</h2>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Basic Text Input</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>&lt;label for="username"&gt;Username:&lt;/label&gt;
&lt;input type="text" id="username" name="username" placeholder="Enter your name"&gt;</code></pre>
                </div>
                
                <div class="note-box">
                    <div class="note-header">
                        <div class="note-icon"><i class="fas fa-lightbulb"></i></div>
                        <div class="note-title">Understanding Input Attributes</div>
                    </div>
                    <ul class="theory-list">
                        <li><code>type</code> - What kind of input (text, email, password, etc.)</li>
                        <li><code>id</code> - Unique identifier (connects to label)</li>
                        <li><code>name</code> - Name for the data when form is submitted</li>
                        <li><code>placeholder</code> - Hint text shown inside the input</li>
                    </ul>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Common Input Types</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>&lt;input type="text" placeholder="Regular text"&gt;
&lt;input type="email" placeholder="email@example.com"&gt;
&lt;input type="password" placeholder="Your password"&gt;
&lt;input type="number" placeholder="Enter a number"&gt;</code></pre>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-caret-square-down"></i></div>
                    <h2 class="section-title">Dropdown Select</h2>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Dropdown Menu</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>&lt;label for="country"&gt;Country:&lt;/label&gt;
&lt;select id="country" name="country"&gt;
    &lt;option value=""&gt;Select a country&lt;/option&gt;
    &lt;option value="us"&gt;United States&lt;/option&gt;
    &lt;option value="uk"&gt;United Kingdom&lt;/option&gt;
    &lt;option value="ca"&gt;Canada&lt;/option&gt;
&lt;/select&gt;</code></pre>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-comment-alt"></i></div>
                    <h2 class="section-title">Text Area (Multi-line)</h2>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Large Text Box</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>&lt;label for="message"&gt;Message:&lt;/label&gt;
&lt;textarea id="message" name="message" rows="4" placeholder="Type your message..."&gt;&lt;/textarea&gt;</code></pre>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-paper-plane"></i></div>
                    <h2 class="section-title">Submit Button</h2>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Button to Submit Form</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>&lt;button type="submit"&gt;Send Message&lt;/button&gt;</code></pre>
                </div>
            </div>

            <div class="exercise-box">
                <div class="exercise-header">
                    <div class="exercise-icon"><i class="fas fa-pencil-alt"></i></div>
                    <div class="exercise-title">📝 Your Task: Create a Contact Form</div>
                </div>
                <p class="theory-text">Build a contact form with name, email, subject dropdown, message, and submit button.</p>
            </div>

            <div class="step-by-step">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Add Name Input</h4>
                        <p>Find <code>&lt;!-- STEP 1 --&gt;</code> and add:</p>
                        <div class="code-inline">&lt;label for="name"&gt;Your Name:&lt;/label&gt;
&lt;input type="text" id="name" name="name" placeholder="John Doe"&gt;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Add Email Input</h4>
                        <p>Find <code>&lt;!-- STEP 2 --&gt;</code> and add:</p>
                        <div class="code-inline">&lt;label for="email"&gt;Your Email:&lt;/label&gt;
&lt;input type="email" id="email" name="email" placeholder="you@example.com"&gt;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Add Subject Dropdown</h4>
                        <p>Find <code>&lt;!-- STEP 3 --&gt;</code> and add:</p>
                        <div class="code-inline">&lt;label for="subject"&gt;Subject:&lt;/label&gt;
&lt;select id="subject" name="subject"&gt;
    &lt;option value=""&gt;Select a topic&lt;/option&gt;
    &lt;option value="general"&gt;General Question&lt;/option&gt;
    &lt;option value="support"&gt;Technical Support&lt;/option&gt;
    &lt;option value="feedback"&gt;Feedback&lt;/option&gt;
&lt;/select&gt;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h4>Add Message Textarea</h4>
                        <p>Find <code>&lt;!-- STEP 4 --&gt;</code> and add:</p>
                        <div class="code-inline">&lt;label for="message"&gt;Your Message:&lt;/label&gt;
&lt;textarea id="message" name="message" rows="5" placeholder="Type your message here..."&gt;&lt;/textarea&gt;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">5</div>
                    <div class="step-content">
                        <h4>Add Submit Button</h4>
                        <p>Find <code>&lt;!-- STEP 5 --&gt;</code> and add:</p>
                        <div class="code-inline">&lt;button type="submit"&gt;Send Message&lt;/button&gt;</div>
                    </div>
                </div>
            </div>
        `,
        initialCode: {
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Form</title>
</head>
<body>
    <div class="container">
        <h1>Contact Us</h1>
        <p>Fill out the form below and we'll get back to you!</p>
        
        <form action="#" method="POST">
        
            <div class="form-group">
                <!-- STEP 1: Add name label and input below -->
                
            </div>
            
            <div class="form-group">
                <!-- STEP 2: Add email label and input below -->
                
            </div>
            
            <div class="form-group">
                <!-- STEP 3: Add subject label and select below -->
                
            </div>
            
            <div class="form-group">
                <!-- STEP 4: Add message label and textarea below -->
                
            </div>
            
            <!-- STEP 5: Add submit button below -->
            
            
        </form>
    </div>
</body>
</html>`,
            css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 40px 20px;
}
.container {
    max-width: 500px;
    margin: 0 auto;
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
h1 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.8rem;
}
h1 + p {
    color: #666;
    margin-bottom: 30px;
}
.form-group {
    margin-bottom: 20px;
}
label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #444;
}
input, select, textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 1rem;
    transition: border-color 0.3s, box-shadow 0.3s;
}
input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}
textarea { resize: vertical; min-height: 120px; }
button[type="submit"] {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}
button[type="submit"]:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}`,
            js: `// No JavaScript needed`
        },
        hints: [
            "💡 Step 1: Add <label for=\"name\">Your Name:</label> then <input type=\"text\" id=\"name\">",
            "💡 Step 2: Same pattern but use type=\"email\" for email validation",
            "💡 Step 3: Use <select> tag with <option> tags inside for dropdown",
            "💡 Step 4: Use <textarea> tag - it doesn't use type attribute",
            "💡 Step 5: Add <button type=\"submit\">Send Message</button>"
        ],
        validation: (code) => {
            const checks = [];
            checks.push({ passed: /<input[^>]+type=["']text["'][^>]*>/i.test(code.html), message: '✓ Added text input for name' });
            checks.push({ passed: /<input[^>]+type=["']email["'][^>]*>/i.test(code.html), message: '✓ Added email input' });
            checks.push({ passed: /<select[\s\S]*>[\s\S]*<option[\s\S]*>[\s\S]*<\/select>/i.test(code.html), message: '✓ Added select dropdown' });
            checks.push({ passed: /<textarea[\s\S]*>[\s\S]*<\/textarea>/i.test(code.html), message: '✓ Added textarea' });
            checks.push({ passed: /<button[^>]+type=["']submit["'][^>]*>/i.test(code.html), message: '✓ Added submit button' });
            checks.push({ passed: (code.html.match(/<label/gi) || []).length >= 4, message: '✓ Added labels for accessibility' });
            return checks;
        }
    },

    // ==========================================
    // LESSON 6: CSS Basics
    // ==========================================
    'css-intro': {
        title: 'Introduction to CSS',
        subtitle: 'Learn how to add colors, fonts, and basic styling to your HTML',
        difficulty: 'Beginner',
        duration: '20 minutes',
        theory: `
            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-paint-brush"></i></div>
                    <h2 class="section-title">What is CSS?</h2>
                </div>
                <p class="theory-text"><strong>CSS (Cascading Style Sheets)</strong> makes your HTML look beautiful. If HTML is the skeleton of your page, CSS is the skin, clothes, and makeup!</p>
                
                <div class="tip-box">
                    <div class="note-header">
                        <div class="note-icon tip-icon"><i class="fas fa-info-circle"></i></div>
                        <div class="note-title tip-title">How to Practice</div>
                    </div>
                    <p class="theory-text">In this lesson, you'll write CSS in the <strong>CSS tab</strong> of the editor. Click the "CSS" tab to switch to it!</p>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-code"></i></div>
                    <h2 class="section-title">CSS Syntax</h2>
                </div>
                <p class="theory-text">CSS has a simple pattern: <strong>selector { property: value; }</strong></p>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> CSS Rule Structure</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>selector {
    property: value;
    another-property: value;
}

/* Example: Make all paragraphs blue */
p {
    color: blue;
}</code></pre>
                </div>
                
                <div class="note-box">
                    <div class="note-header">
                        <div class="note-icon"><i class="fas fa-lightbulb"></i></div>
                        <div class="note-title">Understanding the Parts</div>
                    </div>
                    <ul class="theory-list">
                        <li><strong>Selector</strong> - What element to style (p, h1, .classname)</li>
                        <li><strong>Property</strong> - What aspect to change (color, font-size)</li>
                        <li><strong>Value</strong> - The new setting (blue, 20px)</li>
                    </ul>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-palette"></i></div>
                    <h2 class="section-title">Essential CSS Properties</h2>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Common Properties</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>/* Colors */
color: red;                /* Text color */
background-color: yellow;  /* Background color */

/* Text */
font-size: 20px;           /* Text size */
font-weight: bold;         /* Bold text */
text-align: center;        /* Center text */

/* Spacing */
padding: 20px;             /* Space INSIDE element */
margin: 10px;              /* Space OUTSIDE element */

/* Box */
border: 2px solid black;   /* Border around element */
border-radius: 10px;       /* Rounded corners */</code></pre>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-crosshairs"></i></div>
                    <h2 class="section-title">Selectors</h2>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Types of Selectors</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>/* Element selector - targets all of that element */
p { color: gray; }
h1 { font-size: 32px; }

/* Class selector - targets elements with that class */
.highlight { background-color: yellow; }
.button { padding: 10px 20px; }

/* ID selector - targets one specific element */
#header { background-color: navy; }</code></pre>
                </div>
                
                <div class="note-box">
                    <div class="note-header">
                        <div class="note-icon"><i class="fas fa-lightbulb"></i></div>
                        <div class="note-title">Classes vs Elements</div>
                    </div>
                    <p class="theory-text">Use a <strong>dot (.)</strong> before class names: <code>.card</code><br>
                    No dot for HTML elements: <code>p</code>, <code>h1</code>, <code>body</code></p>
                </div>
            </div>

            <div class="exercise-box">
                <div class="exercise-header">
                    <div class="exercise-icon"><i class="fas fa-pencil-alt"></i></div>
                    <div class="exercise-title">📝 Your Task: Style a Profile Card</div>
                </div>
                <p class="theory-text">The HTML is already written. Your job is to add CSS in the <strong>CSS tab</strong> to make it look beautiful!</p>
            </div>

            <div class="step-by-step">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Style the Card Container</h4>
                        <p>Click the <strong>CSS tab</strong>, find the <code>.card</code> rule and add:</p>
                        <div class="code-inline">background-color: white;
padding: 40px;
border-radius: 20px;
text-align: center;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Make the Image Round</h4>
                        <p>Find <code>.card img</code> and add:</p>
                        <div class="code-inline">border-radius: 50%;
width: 120px;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Style the Name</h4>
                        <p>Find <code>h1</code> and add:</p>
                        <div class="code-inline">color: #333;
font-size: 1.8rem;
margin: 15px 0;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h4>Style the Bio Paragraph</h4>
                        <p>Find <code>.bio</code> and add:</p>
                        <div class="code-inline">color: #666;
font-size: 1rem;
line-height: 1.6;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">5</div>
                    <div class="step-content">
                        <h4>Style the Skill Tags</h4>
                        <p>Find <code>.skill</code> and add:</p>
                        <div class="code-inline">background-color: #667eea;
color: white;
padding: 8px 16px;
border-radius: 20px;
margin: 5px;
display: inline-block;</div>
                    </div>
                </div>
            </div>
        `,
        initialCode: {
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Practice</title>
</head>
<body>
    <div class="card">
        <img src="https://picsum.photos/150" alt="Profile">
        <h1>Sarah Chen</h1>
        <p class="bio">Full-stack developer passionate about creating beautiful and functional websites.</p>
        <div class="skills">
            <span class="skill">HTML</span>
            <span class="skill">CSS</span>
            <span class="skill">JavaScript</span>
        </div>
    </div>
</body>
</html>`,
            css: `/* Page styling - already done for you */
body {
    font-family: 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #667eea, #764ba2);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 20px;
}

/* STEP 1: Style the card - add your CSS below */
.card {
    
}

/* STEP 2: Make image round - add your CSS below */
.card img {
    
}

/* STEP 3: Style the name - add your CSS below */
h1 {
    
}

/* STEP 4: Style the bio - add your CSS below */
.bio {
    
}

/* Skills container - already done */
.skills {
    margin-top: 20px;
}

/* STEP 5: Style skill tags - add your CSS below */
.skill {
    
}`,
            js: `// No JavaScript needed`
        },
        hints: [
            "💡 Click the CSS tab first to edit CSS!",
            "💡 Step 1: Add background-color: white; padding: 40px; border-radius: 20px; text-align: center;",
            "💡 Step 2: border-radius: 50% makes images circular",
            "💡 Step 3: Set color, font-size, and margin for h1",
            "💡 Step 5: display: inline-block lets you add padding to inline elements"
        ],
        validation: (code) => {
            const checks = [];
            checks.push({ passed: /\.card\s*\{[^}]*background/i.test(code.css), message: '✓ Added background to .card' });
            checks.push({ passed: /\.card\s*\{[^}]*padding/i.test(code.css), message: '✓ Added padding to .card' });
            checks.push({ passed: /border-radius\s*:\s*50%/i.test(code.css), message: '✓ Made image round (50%)' });
            checks.push({ passed: /h1\s*\{[^}]*color/i.test(code.css), message: '✓ Styled h1 color' });
            checks.push({ passed: /\.skill\s*\{[^}]*background/i.test(code.css), message: '✓ Added background to .skill' });
            checks.push({ passed: /\.skill\s*\{[^}]*padding/i.test(code.css), message: '✓ Added padding to .skill' });
            return checks;
        }
    },

    // ==========================================
    // LESSON 7: CSS Selectors & Pseudo-classes
    // ==========================================
    'css-selectors': {
        title: 'CSS Selectors & Hover Effects',
        subtitle: 'Learn advanced selectors and how to add interactive hover effects',
        difficulty: 'Intermediate',
        duration: '25 minutes',
        theory: `
            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-mouse-pointer"></i></div>
                    <h2 class="section-title">Hover Effects</h2>
                </div>
                <p class="theory-text">Make elements change when users hover over them with the <code>:hover</code> pseudo-class:</p>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Hover Example</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>/* Normal state */
.button {
    background-color: blue;
    color: white;
}

/* When mouse hovers over it */
.button:hover {
    background-color: darkblue;
}</code></pre>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-arrows-alt"></i></div>
                    <h2 class="section-title">Smooth Transitions</h2>
                </div>
                <p class="theory-text">Add smooth animations to hover effects with <code>transition</code>:</p>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Transition Example</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>.button {
    background-color: blue;
    transition: background-color 0.3s;  /* 0.3 second animation */
}

.button:hover {
    background-color: darkblue;
}</code></pre>
                </div>
                
                <div class="tip-box">
                    <div class="note-header">
                        <div class="note-icon tip-icon"><i class="fas fa-magic"></i></div>
                        <div class="note-title tip-title">Pro Tip</div>
                    </div>
                    <p class="theory-text">Use <code>transition: all 0.3s;</code> to animate ALL property changes at once!</p>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-list-ol"></i></div>
                    <h2 class="section-title">Targeting Specific Items</h2>
                </div>
                <p class="theory-text">Select specific children with <code>:first-child</code>, <code>:last-child</code>, and <code>:nth-child()</code>:</p>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Child Selectors</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>/* First item in a list */
li:first-child {
    font-weight: bold;
}

/* Last item */
li:last-child {
    color: red;
}

/* Every even item (2nd, 4th, 6th...) */
li:nth-child(even) {
    background-color: #f5f5f5;
}</code></pre>
                </div>
            </div>

            <div class="exercise-box">
                <div class="exercise-header">
                    <div class="exercise-icon"><i class="fas fa-pencil-alt"></i></div>
                    <div class="exercise-title">📝 Your Task: Style an Interactive Navigation</div>
                </div>
                <p class="theory-text">Add hover effects and styling to a navigation menu. Work in the <strong>CSS tab</strong>.</p>
            </div>

            <div class="step-by-step">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Style the Nav Links</h4>
                        <p>Find <code>.nav-link</code> and add:</p>
                        <div class="code-inline">color: white;
padding: 12px 20px;
text-decoration: none;
border-radius: 8px;
transition: all 0.3s;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Add Hover Effect</h4>
                        <p>Find <code>.nav-link:hover</code> and add:</p>
                        <div class="code-inline">background-color: rgba(255, 255, 255, 0.2);</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Style the Active Link</h4>
                        <p>Find <code>.nav-link.active</code> and add:</p>
                        <div class="code-inline">background-color: white;
color: #6366f1;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h4>Style First Link Differently</h4>
                        <p>Find <code>.nav-link:first-child</code> and add:</p>
                        <div class="code-inline">font-weight: bold;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">5</div>
                    <div class="step-content">
                        <h4>Add Hover Effect to Cards</h4>
                        <p>Find <code>.card:hover</code> and add:</p>
                        <div class="code-inline">transform: translateY(-5px);
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);</div>
                    </div>
                </div>
            </div>
        `,
        initialCode: {
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Navigation</title>
</head>
<body>
    <nav>
        <a href="#" class="nav-link active">Home</a>
        <a href="#" class="nav-link">About</a>
        <a href="#" class="nav-link">Services</a>
        <a href="#" class="nav-link">Contact</a>
    </nav>
    
    <main>
        <div class="card">
            <h3>Web Design</h3>
            <p>Beautiful, responsive websites</p>
        </div>
        <div class="card">
            <h3>Development</h3>
            <p>Custom web applications</p>
        </div>
        <div class="card">
            <h3>SEO</h3>
            <p>Get found online</p>
        </div>
    </main>
</body>
</html>`,
            css: `body {
    font-family: 'Segoe UI', sans-serif;
    margin: 0;
    background-color: #f0f2f5;
}

nav {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    padding: 15px 30px;
    display: flex;
    gap: 10px;
}

/* STEP 1: Style nav links - add your CSS below */
.nav-link {
    
}

/* STEP 2: Add hover effect - add your CSS below */
.nav-link:hover {
    
}

/* STEP 3: Style active link - add your CSS below */
.nav-link.active {
    
}

/* STEP 4: Style first link - add your CSS below */
.nav-link:first-child {
    
}

main {
    display: flex;
    gap: 20px;
    padding: 40px;
    justify-content: center;
}

.card {
    background: white;
    padding: 30px;
    border-radius: 15px;
    text-align: center;
    width: 200px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: all 0.3s;
}

/* STEP 5: Add card hover effect - add your CSS below */
.card:hover {
    
}

.card h3 { color: #333; margin-bottom: 10px; }
.card p { color: #666; font-size: 0.9rem; }`,
            js: `// No JavaScript needed`
        },
        hints: [
            "💡 Remember to click the CSS tab first!",
            "💡 Step 1: Add color, padding, text-decoration: none, border-radius, and transition",
            "💡 Step 2: Use rgba() for semi-transparent white: rgba(255,255,255,0.2)",
            "💡 Step 3: .nav-link.active targets links with BOTH classes",
            "💡 Step 5: transform: translateY(-5px) moves element up on hover"
        ],
        validation: (code) => {
            const checks = [];
            checks.push({ passed: /\.nav-link\s*\{[^}]*transition/i.test(code.css), message: '✓ Added transition to nav links' });
            checks.push({ passed: /\.nav-link:hover\s*\{[^}]*background/i.test(code.css), message: '✓ Added hover background' });
            checks.push({ passed: /\.nav-link\.active\s*\{[^}]*background/i.test(code.css), message: '✓ Styled active link' });
            checks.push({ passed: /\.nav-link:first-child\s*\{[^}]*font-weight/i.test(code.css), message: '✓ Styled first link' });
            checks.push({ passed: /\.card:hover\s*\{[^}]*transform/i.test(code.css), message: '✓ Added card hover transform' });
            return checks;
        }
    },

    // ==========================================
    // LESSON 8: Box Model
    // ==========================================
    'css-box-model': {
        title: 'The CSS Box Model',
        subtitle: 'Understand padding, margin, and borders - the foundation of CSS layout',
        difficulty: 'Intermediate',
        duration: '25 minutes',
        theory: `
            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-cube"></i></div>
                    <h2 class="section-title">Every Element is a Box</h2>
                </div>
                <p class="theory-text">In CSS, every element is treated as a rectangular box. The box has layers (from inside to outside):</p>
                
                <div class="box-model-visual">
                    <div class="bm-margin">MARGIN (outside spacing)
                        <div class="bm-border">BORDER
                            <div class="bm-padding">PADDING (inside spacing)
                                <div class="bm-content">CONTENT</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-expand"></i></div>
                    <h2 class="section-title">Padding vs Margin</h2>
                </div>
                
                <div class="comparison-box">
                    <div class="compare-item">
                        <h4>📦 Padding</h4>
                        <p>Space <strong>inside</strong> the border<br>Background color fills this area</p>
                    </div>
                    <div class="compare-item">
                        <h4>↔️ Margin</h4>
                        <p>Space <strong>outside</strong> the border<br>Creates gap between elements</p>
                    </div>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Padding & Margin</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>/* All sides same */
padding: 20px;
margin: 10px;

/* Top/Bottom and Left/Right */
padding: 10px 20px;     /* 10px top/bottom, 20px left/right */

/* All four sides: top right bottom left */
margin: 10px 20px 15px 25px;

/* Center horizontally */
margin: 0 auto;</code></pre>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-border-all"></i></div>
                    <h2 class="section-title">Borders</h2>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Border Properties</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>/* Shorthand: width style color */
border: 2px solid #333;
border: 3px dashed blue;
border: 1px dotted red;

/* Individual sides */
border-top: 2px solid black;
border-bottom: 1px solid gray;

/* Rounded corners */
border-radius: 10px;      /* All corners */
border-radius: 50%;       /* Makes circles */</code></pre>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-ruler-combined"></i></div>
                    <h2 class="section-title">Box Sizing Fix</h2>
                </div>
                <p class="theory-text">By default, padding and border are <strong>added</strong> to width/height. This makes calculations difficult. Use this fix:</p>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Always Add This!</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>* {
    box-sizing: border-box;
}</code></pre>
                </div>
                
                <div class="tip-box">
                    <div class="note-header">
                        <div class="note-icon tip-icon"><i class="fas fa-star"></i></div>
                        <div class="note-title tip-title">What This Does</div>
                    </div>
                    <p class="theory-text">With <code>box-sizing: border-box</code>, if you set <code>width: 200px</code>, the element will be exactly 200px wide - padding and border are included!</p>
                </div>
            </div>

            <div class="exercise-box">
                <div class="exercise-header">
                    <div class="exercise-icon"><i class="fas fa-pencil-alt"></i></div>
                    <div class="exercise-title">📝 Your Task: Create Pricing Cards</div>
                </div>
                <p class="theory-text">Style pricing cards using the box model properties.</p>
            </div>

            <div class="step-by-step">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Add the Box-Sizing Reset</h4>
                        <p>Find the <code>*</code> selector at the top and add:</p>
                        <div class="code-inline">box-sizing: border-box;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Style the Card Base</h4>
                        <p>Find <code>.card</code> and add:</p>
                        <div class="code-inline">background: white;
padding: 30px;
margin: 10px;
border-radius: 15px;
border: 2px solid #e0e0e0;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Add Shadow to Cards</h4>
                        <p>Still in <code>.card</code>, add:</p>
                        <div class="code-inline">box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h4>Style the Featured Card</h4>
                        <p>Find <code>.card.featured</code> and add:</p>
                        <div class="code-inline">border: 2px solid #6366f1;
transform: scale(1.05);</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">5</div>
                    <div class="step-content">
                        <h4>Style the Price</h4>
                        <p>Find <code>.price</code> and add:</p>
                        <div class="code-inline">font-size: 2.5rem;
color: #6366f1;
margin: 20px 0;
padding: 15px;
border-top: 1px solid #eee;
border-bottom: 1px solid #eee;</div>
                    </div>
                </div>
            </div>
        `,
        initialCode: {
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pricing Cards</title>
</head>
<body>
    <h1>Choose Your Plan</h1>
    
    <div class="cards">
        <div class="card">
            <h2>Basic</h2>
            <div class="price">$9</div>
            <ul>
                <li>5 Projects</li>
                <li>10 GB Storage</li>
                <li>Email Support</li>
            </ul>
            <button>Get Started</button>
        </div>
        
        <div class="card featured">
            <span class="badge">Popular</span>
            <h2>Pro</h2>
            <div class="price">$29</div>
            <ul>
                <li>Unlimited Projects</li>
                <li>100 GB Storage</li>
                <li>Priority Support</li>
            </ul>
            <button>Get Started</button>
        </div>
        
        <div class="card">
            <h2>Enterprise</h2>
            <div class="price">$99</div>
            <ul>
                <li>Unlimited Everything</li>
                <li>1 TB Storage</li>
                <li>24/7 Support</li>
            </ul>
            <button>Get Started</button>
        </div>
    </div>
</body>
</html>`,
            css: `/* STEP 1: Add box-sizing reset */
* {
    margin: 0;
    padding: 0;
    
}

body {
    font-family: 'Segoe UI', sans-serif;
    background: #f5f7fa;
    padding: 40px 20px;
    text-align: center;
}

h1 {
    color: #333;
    margin-bottom: 40px;
}

.cards {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
}

/* STEPS 2 & 3: Style card base and shadow */
.card {
    width: 280px;
    text-align: center;
    position: relative;
    
}

/* STEP 4: Style featured card */
.card.featured {
    
}

.badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: #6366f1;
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 0.8rem;
}

.card h2 {
    color: #333;
    font-size: 1.5rem;
}

/* STEP 5: Style price */
.price {
    font-weight: bold;
    
}

.card ul {
    list-style: none;
    margin: 20px 0;
}

.card li {
    padding: 10px 0;
    color: #666;
    border-bottom: 1px solid #eee;
}

.card button {
    width: 100%;
    padding: 12px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s;
}

.card button:hover {
    background: #4f46e5;
}`,
            js: `// No JavaScript needed`
        },
        hints: [
            "💡 Step 1: Add box-sizing: border-box; after padding: 0; in the * selector",
            "💡 Step 2: Add background, padding, margin, border-radius, and border to .card",
            "💡 Step 3: box-shadow format: x-offset y-offset blur color",
            "💡 Step 4: transform: scale(1.05) makes the card 5% larger",
            "💡 Step 5: Use both border-top and border-bottom to create lines above and below"
        ],
        validation: (code) => {
            const checks = [];
            checks.push({ passed: /box-sizing\s*:\s*border-box/i.test(code.css), message: '✓ Added box-sizing: border-box' });
            checks.push({ passed: /\.card\s*\{[^}]*padding/i.test(code.css), message: '✓ Added padding to cards' });
            checks.push({ passed: /\.card\s*\{[^}]*border-radius/i.test(code.css), message: '✓ Added border-radius to cards' });
            checks.push({ passed: /box-shadow/i.test(code.css), message: '✓ Added box-shadow' });
            checks.push({ passed: /\.card\.featured\s*\{[^}]*border/i.test(code.css), message: '✓ Styled featured card border' });
            checks.push({ passed: /\.price\s*\{[^}]*font-size/i.test(code.css), message: '✓ Styled price font-size' });
            return checks;
        }
    },

    // ==========================================
    // LESSON 9: Flexbox
    // ==========================================
    'css-flexbox': {
        title: 'Flexbox Layout',
        subtitle: 'Create flexible, responsive layouts with CSS Flexbox',
        difficulty: 'Intermediate',
        duration: '30 minutes',
        theory: `
            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-columns"></i></div>
                    <h2 class="section-title">What is Flexbox?</h2>
                </div>
                <p class="theory-text"><strong>Flexbox</strong> makes it easy to arrange elements in rows or columns. No more struggling with float or position!</p>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Enable Flexbox</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>.container {
    display: flex;
}
/* Now all children become flex items! */</code></pre>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-arrows-alt-h"></i></div>
                    <h2 class="section-title">Main Axis Alignment (justify-content)</h2>
                </div>
                <p class="theory-text">Controls horizontal alignment (left/right):</p>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> justify-content Values</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>justify-content: flex-start;    /* Left (default) */
justify-content: center;        /* Center */
justify-content: flex-end;      /* Right */
justify-content: space-between; /* Spread with space between */
justify-content: space-evenly;  /* Equal space everywhere */</code></pre>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-arrows-alt-v"></i></div>
                    <h2 class="section-title">Cross Axis Alignment (align-items)</h2>
                </div>
                <p class="theory-text">Controls vertical alignment (top/bottom):</p>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> align-items Values</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>align-items: stretch;    /* Fill height (default) */
align-items: flex-start; /* Top */
align-items: center;     /* Middle */
align-items: flex-end;   /* Bottom */</code></pre>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-magic"></i></div>
                    <h2 class="section-title">Useful Flexbox Properties</h2>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> More Flexbox</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>/* Gap between items */
gap: 20px;

/* Wrap to new line when needed */
flex-wrap: wrap;

/* Change direction to column */
flex-direction: column;

/* Perfect centering trick! */
display: flex;
justify-content: center;
align-items: center;</code></pre>
                </div>
            </div>

            <div class="exercise-box">
                <div class="exercise-header">
                    <div class="exercise-icon"><i class="fas fa-pencil-alt"></i></div>
                    <div class="exercise-title">📝 Your Task: Build a Dashboard Layout</div>
                </div>
                <p class="theory-text">Use Flexbox to create a navigation bar and card grid.</p>
            </div>

            <div class="step-by-step">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Make the Navbar Flex</h4>
                        <p>Find <code>nav</code> and add:</p>
                        <div class="code-inline">display: flex;
justify-content: space-between;
align-items: center;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Style Nav Links Container</h4>
                        <p>Find <code>.nav-links</code> and add:</p>
                        <div class="code-inline">display: flex;
gap: 20px;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Make Cards Wrap</h4>
                        <p>Find <code>.cards</code> and add:</p>
                        <div class="code-inline">display: flex;
flex-wrap: wrap;
gap: 20px;
justify-content: center;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h4>Center Icon in Stat Cards</h4>
                        <p>Find <code>.stat-icon</code> and add:</p>
                        <div class="code-inline">display: flex;
justify-content: center;
align-items: center;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">5</div>
                    <div class="step-content">
                        <h4>Make Footer Links Flex</h4>
                        <p>Find <code>footer</code> and add:</p>
                        <div class="code-inline">display: flex;
justify-content: center;
gap: 30px;</div>
                    </div>
                </div>
            </div>
        `,
        initialCode: {
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
</head>
<body>
    <nav>
        <div class="logo">📊 Dashboard</div>
        <div class="nav-links">
            <a href="#">Home</a>
            <a href="#">Reports</a>
            <a href="#">Settings</a>
        </div>
    </nav>
    
    <main>
        <h1>Welcome Back!</h1>
        
        <div class="cards">
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                    <h3>2,543</h3>
                    <p>Total Users</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                    <h3>$12,500</h3>
                    <p>Revenue</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">📈</div>
                <div class="stat-info">
                    <h3>+24%</h3>
                    <p>Growth</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-info">
                    <h3>4.9</h3>
                    <p>Rating</p>
                </div>
            </div>
        </div>
    </main>
    
    <footer>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Contact</a>
    </footer>
</body>
</html>`,
            css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: 'Segoe UI', sans-serif;
    background: #f0f2f5;
    min-height: 100vh;
}

/* STEP 1: Make navbar flex with space-between */
nav {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    padding: 15px 30px;
    color: white;
    
}

.logo { font-size: 1.3rem; font-weight: bold; }

/* STEP 2: Make nav-links flex */
.nav-links {
    
}

.nav-links a {
    color: rgba(255,255,255,0.9);
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 6px;
    transition: background 0.3s;
}
.nav-links a:hover { background: rgba(255,255,255,0.2); }

main {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 20px;
}

h1 { color: #333; margin-bottom: 30px; }

/* STEP 3: Make cards flex and wrap */
.cards {
    
}

.stat-card {
    background: white;
    padding: 25px;
    border-radius: 15px;
    width: 220px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    display: flex;
    gap: 15px;
    align-items: center;
}

/* STEP 4: Center icon */
.stat-icon {
    width: 50px;
    height: 50px;
    background: #f0f2f5;
    border-radius: 12px;
    font-size: 1.5rem;
    
}

.stat-info h3 { color: #333; font-size: 1.5rem; }
.stat-info p { color: #888; font-size: 0.9rem; }

/* STEP 5: Make footer flex */
footer {
    padding: 30px;
    background: white;
    margin-top: 40px;
    
}

footer a {
    color: #666;
    text-decoration: none;
}
footer a:hover { color: #6366f1; }`,
            js: `// No JavaScript needed`
        },
        hints: [
            "💡 Step 1: Add display: flex, then justify-content: space-between, then align-items: center",
            "💡 Step 2: display: flex and gap: 20px puts space between links",
            "💡 Step 3: flex-wrap: wrap allows cards to go to next line on small screens",
            "💡 Step 4: justify-content and align-items both set to center = perfect centering",
            "💡 Step 5: Same pattern as step 4, but with gap for spacing"
        ],
        validation: (code) => {
            const checks = [];
            checks.push({ passed: /nav\s*\{[^}]*display\s*:\s*flex/i.test(code.css), message: '✓ Nav uses flexbox' });
            checks.push({ passed: /justify-content\s*:\s*space-between/i.test(code.css), message: '✓ Used space-between' });
            checks.push({ passed: /\.nav-links\s*\{[^}]*display\s*:\s*flex/i.test(code.css), message: '✓ Nav-links uses flexbox' });
            checks.push({ passed: /\.cards\s*\{[^}]*flex-wrap\s*:\s*wrap/i.test(code.css), message: '✓ Cards wrap' });
            checks.push({ passed: /\.stat-icon\s*\{[^}]*justify-content\s*:\s*center/i.test(code.css), message: '✓ Icon is centered' });
            checks.push({ passed: /footer\s*\{[^}]*display\s*:\s*flex/i.test(code.css), message: '✓ Footer uses flexbox' });
            return checks;
        }
    },

    // ==========================================
    // LESSON 10: CSS Grid
    // ==========================================
    'css-grid': {
        title: 'CSS Grid Layout',
        subtitle: 'Create two-dimensional layouts with the powerful CSS Grid',
        difficulty: 'Intermediate',
        duration: '30 minutes',
        theory: `
            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-th"></i></div>
                    <h2 class="section-title">What is CSS Grid?</h2>
                </div>
                <p class="theory-text"><strong>CSS Grid</strong> is perfect for creating complex layouts with rows AND columns. Think of it like a spreadsheet!</p>
                
                <div class="comparison-box">
                    <div class="compare-item">
                        <h4>Flexbox</h4>
                        <p>One direction (row OR column)</p>
                    </div>
                    <div class="compare-item">
                        <h4>Grid</h4>
                        <p>Two directions (rows AND columns)</p>
                    </div>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-code"></i></div>
                    <h2 class="section-title">Creating a Grid</h2>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Basic Grid</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>.container {
    display: grid;
    grid-template-columns: 200px 200px 200px;  /* 3 columns */
    gap: 20px;  /* Space between items */
}</code></pre>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-expand-arrows-alt"></i></div>
                    <h2 class="section-title">Flexible Columns with fr</h2>
                </div>
                <p class="theory-text">The <code>fr</code> unit means "fraction of available space":</p>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Fractional Units</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>/* Equal columns */
grid-template-columns: 1fr 1fr 1fr;      /* 3 equal columns */

/* Different sizes */
grid-template-columns: 1fr 2fr 1fr;      /* Middle is twice as wide */

/* Mix fixed and flexible */
grid-template-columns: 250px 1fr;        /* Sidebar + main content */</code></pre>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-redo"></i></div>
                    <h2 class="section-title">Repeat and Auto-fit</h2>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Responsive Grid</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>/* Repeat same column 4 times */
grid-template-columns: repeat(4, 1fr);

/* Responsive: fit as many 250px columns as possible */
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));</code></pre>
                </div>
                
                <div class="tip-box">
                    <div class="note-header">
                        <div class="note-icon tip-icon"><i class="fas fa-star"></i></div>
                        <div class="note-title tip-title">The Magic Formula!</div>
                    </div>
                    <p class="theory-text"><code>repeat(auto-fit, minmax(250px, 1fr))</code> creates a responsive grid that automatically adjusts the number of columns!</p>
                </div>
            </div>

            <div class="theory-section">
                <div class="section-header">
                    <div class="section-icon"><i class="fas fa-expand"></i></div>
                    <h2 class="section-title">Spanning Multiple Columns/Rows</h2>
                </div>
                
                <div class="code-block">
                    <div class="code-block-header">
                        <div class="code-block-title"><i class="fas fa-code"></i> Grid Span</div>
                        <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                    <pre><code>/* Make item span 2 columns */
.wide-item {
    grid-column: span 2;
}

/* Full width item */
.full-width {
    grid-column: 1 / -1;  /* From first to last column */
}</code></pre>
                </div>
            </div>

            <div class="exercise-box">
                <div class="exercise-header">
                    <div class="exercise-icon"><i class="fas fa-pencil-alt"></i></div>
                    <div class="exercise-title">📝 Your Task: Create a Photo Gallery</div>
                </div>
                <p class="theory-text">Build a responsive photo gallery with a featured image that spans multiple columns.</p>
            </div>

            <div class="step-by-step">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Enable Grid on Gallery</h4>
                        <p>Find <code>.gallery</code> and add:</p>
                        <div class="code-inline">display: grid;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Create Responsive Columns</h4>
                        <p>Still in <code>.gallery</code>, add:</p>
                        <div class="code-inline">grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Add Gap Between Items</h4>
                        <p>Still in <code>.gallery</code>, add:</p>
                        <div class="code-inline">gap: 20px;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h4>Make Featured Image Span 2 Columns</h4>
                        <p>Find <code>.featured</code> and add:</p>
                        <div class="code-inline">grid-column: span 2;</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">5</div>
                    <div class="step-content">
                        <h4>Style the Card Height</h4>
                        <p>Find <code>.card</code> and add:</p>
                        <div class="code-inline">height: 250px;
border-radius: 15px;
overflow: hidden;</div>
                    </div>
                </div>
            </div>
        `,
        initialCode: {
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photo Gallery</title>
</head>
<body>
    <h1>📸 My Gallery</h1>
    
    <div class="gallery">
        <div class="card featured">
            <img src="https://picsum.photos/800/400?1" alt="Featured photo">
            <div class="caption">Featured Photo</div>
        </div>
        
        <div class="card">
            <img src="https://picsum.photos/400/400?2" alt="Photo">
            <div class="caption">Nature</div>
        </div>
        
        <div class="card">
            <img src="https://picsum.photos/400/400?3" alt="Photo">
            <div class="caption">City</div>
        </div>
        
        <div class="card">
            <img src="https://picsum.photos/400/400?4" alt="Photo">
            <div class="caption">Portrait</div>
        </div>
        
        <div class="card">
            <img src="https://picsum.photos/400/400?5" alt="Photo">
            <div class="caption">Abstract</div>
        </div>
        
        <div class="card">
            <img src="https://picsum.photos/400/400?6" alt="Photo">
            <div class="caption">Travel</div>
        </div>
    </div>
</body>
</html>`,
            css: `* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Segoe UI', sans-serif;
    background: #1a1a2e;
    color: white;
    padding: 40px;
    min-height: 100vh;
}

h1 {
    text-align: center;
    margin-bottom: 40px;
    font-size: 2rem;
}

/* STEPS 1, 2, 3: Make gallery a responsive grid */
.gallery {
    max-width: 1200px;
    margin: 0 auto;
    
}

/* STEP 4: Make featured span 2 columns */
.featured {
    
}

/* STEP 5: Style cards */
.card {
    position: relative;
    
}

.card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.card:hover img {
    transform: scale(1.1);
}

.caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    background: linear-gradient(transparent, rgba(0,0,0,0.8));
    font-weight: 500;
}`,
            js: `// No JavaScript needed`
        },
        hints: [
            "💡 Step 1: Just add display: grid; to .gallery",
            "💡 Step 2: Copy exactly: grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));",
            "💡 Step 3: gap: 20px; adds space between all grid items",
            "💡 Step 4: grid-column: span 2; makes the featured card take 2 columns",
            "💡 Step 5: overflow: hidden; prevents the image from going outside on hover"
        ],
        validation: (code) => {
            const checks = [];
            checks.push({ passed: /\.gallery\s*\{[^}]*display\s*:\s*grid/i.test(code.css), message: '✓ Gallery uses CSS Grid' });
            checks.push({ passed: /grid-template-columns/i.test(code.css), message: '✓ Defined grid columns' });
            checks.push({ passed: /repeat\s*\([^)]*auto-fit/i.test(code.css), message: '✓ Used repeat with auto-fit' });
            checks.push({ passed: /minmax/i.test(code.css), message: '✓ Used minmax for responsive columns' });
            checks.push({ passed: /\.featured\s*\{[^}]*grid-column\s*:\s*span\s*2/i.test(code.css), message: '✓ Featured spans 2 columns' });
            checks.push({ passed: /\.card\s*\{[^}]*height/i.test(code.css), message: '✓ Set card height' });
            return checks;
        }
    }
};

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    menuToggle: document.getElementById('menu-toggle'),
    sidebar: document.getElementById('sidebar'),
    mainContent: document.getElementById('main-content'),
    lessonTitle: document.getElementById('lesson-title'),
    lessonSubtitle: document.getElementById('lesson-subtitle'),
    theoryContent: document.getElementById('theory-content'),
    lessonScore: document.getElementById('lesson-score'),
    progressFill: document.getElementById('progress-fill'),
    progressValue: document.getElementById('progress-value'),
    htmlProgress: document.getElementById('html-progress'),
    cssProgress: document.getElementById('css-progress'),
    lessonItems: document.querySelectorAll('.lesson-item'),
    fileTabs: document.getElementById('file-tabs'),
    codeEditor: document.getElementById('code-editor'),
    lineNumbers: document.getElementById('line-numbers'),
    previewFrame: document.getElementById('preview-frame'),
    runBtn: document.getElementById('run-btn'),
    resetBtn: document.getElementById('reset-btn'),
    submitBtn: document.getElementById('submit-btn'),
    hintBtn: document.getElementById('hint-btn'),
    refreshPreview: document.getElementById('refresh-preview'),
    autoRefresh: document.getElementById('auto-refresh'),
    lineNumbersToggle: document.getElementById('line-numbers-toggle'),
    completionOverlay: document.getElementById('completion-overlay'),
    completionText: document.getElementById('completion-text'),
    reviewBtn: document.getElementById('review-btn'),
    nextLessonBtn: document.getElementById('next-lesson-btn'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message')
};

// ============================================
// STATE VARIABLES
// ============================================
let currentFile = 'html';
let editorContent = { html: '', css: '', js: '' };
let autoRefreshTimer = null;
let currentHintIndex = 0;

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showToast(message, type = 'info') {
    elements.toast.className = `toast toast-${type} show`;
    elements.toastMessage.textContent = message;
    setTimeout(() => elements.toast.classList.remove('show'), 4000);
}

function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => button.innerHTML = originalText, 2000);
    });
}

// ============================================
// PROGRESS TRACKING
// ============================================
function updateProgress() {
    const totalLessons = CONFIG.progress.overall.total;
    const completedLessons = CONFIG.progress.overall.completed;
    const percentage = Math.round((completedLessons / totalLessons) * 100);
    
    elements.progressFill.style.width = `${percentage}%`;
    elements.progressValue.textContent = `${percentage}%`;
    elements.htmlProgress.textContent = `${CONFIG.progress.html.completed}/${CONFIG.progress.html.total}`;
    elements.cssProgress.textContent = `${CONFIG.progress.css.completed}/${CONFIG.progress.css.total}`;
}

function markLessonCompleted(lessonId) {
    const lessonItem = document.querySelector(`[data-lesson="${lessonId}"]`);
    if (lessonItem && !lessonItem.classList.contains('completed')) {
        lessonItem.classList.add('completed');
        const statusIcon = lessonItem.querySelector('.lesson-status i');
        if (statusIcon) statusIcon.className = 'fas fa-check-circle';
        
        if (lessonId.startsWith('html')) {
            CONFIG.progress.html.completed++;
        } else if (lessonId.startsWith('css')) {
            CONFIG.progress.css.completed++;
        }
        CONFIG.progress.overall.completed++;
        updateProgress();
        
        // ✅ ДОБАВЬТЕ ЭТИ 4 СТРОКИ
        const currentUser = localStorage.getItem('codecraft_current_user');
        if (currentUser) {
            saveProgress(currentUser);
        }
    }
}

// ============================================
// EDITOR FUNCTIONS
// ============================================
function updateLineNumbers() {
    const lines = elements.codeEditor.value.split('\n').length;
    const numbers = Array.from({ length: Math.max(lines, 25) }, (_, i) => i + 1).join('<br>');
    elements.lineNumbers.innerHTML = numbers;
    elements.lineNumbers.style.display = CONFIG.lineNumbers ? 'block' : 'none';
}

function saveCurrentFile() {
    editorContent[currentFile] = elements.codeEditor.value;
}

function loadCurrentFile() {
    elements.codeEditor.value = editorContent[currentFile];
    updateLineNumbers();
}

function updateFileTabs() {
    document.querySelectorAll('.file-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.file === currentFile);
    });
}

function runCode() {
    saveCurrentFile();
    
    const htmlContent = editorContent.html;
    const cssContent = `<style>${editorContent.css}</style>`;
    const jsContent = `<script>${editorContent.js}<\/script>`;
    
    let finalHtml = htmlContent;
    if (!htmlContent.includes('</head>')) {
        finalHtml = `<!DOCTYPE html><html><head>${cssContent}</head><body>${htmlContent}${jsContent}</body></html>`;
    } else {
        finalHtml = htmlContent.replace('</head>', `${cssContent}</head>`);
        finalHtml = finalHtml.replace('</body>', `${jsContent}</body>`);
    }
    
    const blob = new Blob([finalHtml], { type: 'text/html' });
    elements.previewFrame.src = URL.createObjectURL(blob);
}

function resetCode() {
    const lesson = LESSONS[CONFIG.currentLesson];
    if (lesson) {
        editorContent = { ...lesson.initialCode };
        loadCurrentFile();
        runCode();
        currentHintIndex = 0;
        showToast('Code reset to initial state', 'info');
    }
}

function showHint() {
    const lesson = LESSONS[CONFIG.currentLesson];
    if (lesson && lesson.hints && lesson.hints.length > 0) {
        const hint = lesson.hints[currentHintIndex];
        showToast(hint, 'info');
        currentHintIndex = (currentHintIndex + 1) % lesson.hints.length;
    }
}

function submitSolution() {
    saveCurrentFile();
    const lesson = LESSONS[CONFIG.currentLesson];
    
    if (lesson && lesson.validation) {
        const results = lesson.validation(editorContent);
        const passed = results.filter(r => r.passed).length;
        const total = results.length;
        const score = Math.round((passed / total) * 100);
        
        CONFIG.userScores[CONFIG.currentLesson] = score;
        elements.lessonScore.textContent = `${score}%`;
        
        // Build feedback message
        let feedback = results.map(r => r.passed ? r.message : `✗ ${r.message.replace('✓ ', '')}`).join('\n');
        
        if (score >= 75) {
            markLessonCompleted(CONFIG.currentLesson);
            elements.completionText.textContent = `Excellent! You scored ${score}% (${passed}/${total} checks passed)`;
            elements.completionOverlay.classList.add('active');
            showToast('🎉 Lesson completed! Great job!', 'success');
        } else {
            showToast(`Score: ${score}% - Keep trying! Check the hints for help.`, 'error');
            console.log('Validation results:\n' + feedback);
        }
    }
}

// ============================================
// LESSON LOADING
// ============================================
function loadLesson(lessonId) {
    const lesson = LESSONS[lessonId];
    if (!lesson) return;
    
    CONFIG.currentLesson = lessonId;
    currentHintIndex = 0;
    
    elements.lessonTitle.textContent = lesson.title;
    elements.lessonSubtitle.textContent = lesson.subtitle;
    elements.theoryContent.innerHTML = lesson.theory;
    
    editorContent = { ...lesson.initialCode };
    currentFile = 'html';
    loadCurrentFile();
    updateFileTabs();
    
    elements.lessonItems.forEach(item => {
        item.classList.toggle('active', item.dataset.lesson === lessonId);
    });
    
    const currentScore = CONFIG.userScores[lessonId] || '--';
    elements.lessonScore.textContent = currentScore === '--' ? '--' : `${currentScore}%`;
    
    if (window.innerWidth <= 992) {
        elements.sidebar.classList.add('collapsed');
    }
    
    setTimeout(runCode, 100);
    
    // ✅ ДОБАВЬТЕ ЭТИ 4 СТРОКИ
    const currentUser = localStorage.getItem('codecraft_current_user');
    if (currentUser) {
        saveProgress(currentUser);
    }
}

function navigateToNextLesson() {
    const lessons = Array.from(elements.lessonItems);
    const currentIndex = lessons.findIndex(item => item.dataset.lesson === CONFIG.currentLesson);
    
    if (currentIndex < lessons.length - 1) {
        const nextLesson = lessons[currentIndex + 1].dataset.lesson;
        loadLesson(nextLesson);
    }
    
    elements.completionOverlay.classList.remove('active');
}

// ============================================
// EVENT LISTENERS
// ============================================
function initializeEventListeners() {
    elements.menuToggle?.addEventListener('click', () => {
        elements.sidebar.classList.toggle('collapsed');
    });

    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 992 && 
            !elements.sidebar.contains(event.target) && 
            !elements.menuToggle.contains(event.target) &&
            !elements.sidebar.classList.contains('collapsed')) {
            elements.sidebar.classList.add('collapsed');
        }
    });

    elements.lessonItems.forEach(item => {
        item.addEventListener('click', () => loadLesson(item.dataset.lesson));
    });

    elements.fileTabs?.addEventListener('click', (event) => {
        const tab = event.target.closest('.file-tab');
        if (tab) {
            saveCurrentFile();
            currentFile = tab.dataset.file;
            loadCurrentFile();
            updateFileTabs();
        }
    });

    elements.autoRefresh?.addEventListener('change', () => {
        CONFIG.autoRefresh = elements.autoRefresh.checked;
    });

    elements.lineNumbersToggle?.addEventListener('change', () => {
        CONFIG.lineNumbers = elements.lineNumbersToggle.checked;
        updateLineNumbers();
    });

    elements.codeEditor?.addEventListener('input', () => {
        updateLineNumbers();
        if (CONFIG.autoRefresh) {
            clearTimeout(autoRefreshTimer);
            autoRefreshTimer = setTimeout(runCode, 800);
        }
    });

    elements.codeEditor?.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            const start = elements.codeEditor.selectionStart;
            const end = elements.codeEditor.selectionEnd;
            elements.codeEditor.value = elements.codeEditor.value.substring(0, start) + '    ' + elements.codeEditor.value.substring(end);
            elements.codeEditor.selectionStart = elements.codeEditor.selectionEnd = start + 4;
            updateLineNumbers();
        }
    });

    elements.runBtn?.addEventListener('click', runCode);
    elements.resetBtn?.addEventListener('click', resetCode);
    elements.submitBtn?.addEventListener('click', submitSolution);
    elements.hintBtn?.addEventListener('click', showHint);
    elements.refreshPreview?.addEventListener('click', runCode);
    elements.reviewBtn?.addEventListener('click', () => elements.completionOverlay.classList.remove('active'));
    elements.nextLessonBtn?.addEventListener('click', navigateToNextLesson);

    elements.theoryContent?.addEventListener('click', (event) => {
        if (event.target.closest('.copy-code')) {
            copyCode(event.target.closest('.copy-code'));
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) {
            elements.sidebar.classList.remove('collapsed');
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================
function initializeApp() {
    loadLesson('html-structure');
    updateProgress();
    initializeEventListeners();
    setTimeout(() => showToast('Welcome! Start with Lesson 1 and follow the steps.', 'success'), 1000);
    updateLineNumbers();
    runCode();
}

document.addEventListener('DOMContentLoaded', initializeAppWithLogin);
