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

const STORAGE_KEY = 'codecraft_user_progress';

// ============================================
// SAVE / LOAD PROGRESS
// ============================================
function saveProgress(username) {
    const progressData = {
        username,
        lastAccessed: new Date().toISOString(),
        currentLesson: CONFIG.currentLesson,
        scores: CONFIG.userScores,
        completedLessons: getCompletedLessons(),
        htmlProgress: CONFIG.progress.html,
        cssProgress: CONFIG.progress.css,
        overallProgress: CONFIG.progress.overall,
        version: CONFIG.version
    };
    const all = getAllProgress();
    all[username.toLowerCase()] = progressData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function loadProgress(username) {
    const all = getAllProgress();
    const data = all[username.toLowerCase()];
    if (data) {
        CONFIG.currentLesson = data.currentLesson || 'html-structure';
        CONFIG.userScores = data.scores || {};
        CONFIG.progress.html = data.htmlProgress || { completed: 0, total: 5 };
        CONFIG.progress.css = data.cssProgress || { completed: 0, total: 5 };
        CONFIG.progress.overall = data.overallProgress || { completed: 0, total: 10 };
        restoreCompletedLessons(data.completedLessons || []);
        loadLesson(CONFIG.currentLesson);
        updateProgress();
        showToast(`Welcome back, ${username}! `, 'success');
        return true;
    }
    return false;
}

function getAllProgress() {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : {};
}

function getCompletedLessons() {
    const completed = [];
    elements.lessonItems.forEach(item => {
        if (item.classList.contains('completed')) completed.push(item.dataset.lesson);
    });
    return completed;
}

function restoreCompletedLessons(list) {
    elements.lessonItems.forEach(item => {
        if (list.includes(item.dataset.lesson)) {
            item.classList.add('completed');
            const icon = item.querySelector('.lesson-status i');
            if (icon) icon.className = 'fas fa-check-circle';
        }
    });
}

// ============================================
// LOGIN MODAL
// ============================================
function showLoginModal() {
    const savedUser = localStorage.getItem('codecraft_current_user');
    if (savedUser && loadProgress(savedUser)) {
        addLogoutButton();
        return;
    }

    const users = Object.values(getAllProgress());
    let userListHTML = '';
    if (users.length > 0) {
        userListHTML = '<div class="saved-users"><h4>Continue as:</h4><ul>';
        users.forEach(u => {
            const pct = Math.round((u.overallProgress.completed / u.overallProgress.total) * 100);
            userListHTML += `<li onclick="loadUserProgress('${u.username}')"><strong>${u.username}</strong> — ${pct}% complete</li>`;
        });
        userListHTML += '</ul></div>';
    }

    const modal = document.createElement('div');
    modal.className = 'login-modal';
    modal.innerHTML = `
        <div class="login-card">
            <h2>Welcome to Code Lab! </h2>
            <p>Enter your name to start or continue learning.</p>
            ${userListHTML}
            <form id="login-form">
                <input type="text" id="username-input" placeholder="Enter your name" required minlength="2" autocomplete="off"/>
                <button type="submit" class="btn btn-primary"><i class="fas fa-sign-in-alt"></i> Start Learning</button>
            </form>
        </div>`;
    document.body.appendChild(modal);
    setTimeout(() => document.getElementById('username-input')?.focus(), 300);

    document.getElementById('login-form').addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('username-input').value.trim();
        if (name.length >= 2) {
            localStorage.setItem('codecraft_current_user', name);
            if (!loadProgress(name)) {
                showToast(`Welcome, ${name}! Let's start learning! `, 'success');
                loadLesson('html-structure');
            }
            addLogoutButton();
            modal.remove();
        }
    });
}

window.loadUserProgress = function(username) {
    localStorage.setItem('codecraft_current_user', username);
    loadProgress(username);
    addLogoutButton();
    document.querySelector('.login-modal')?.remove();
};

function addLogoutButton() {
    if (document.getElementById('logout-btn')) return;
    const headerActions = document.querySelector('.header-actions');
    const currentUser = localStorage.getItem('codecraft_current_user');
    if (currentUser && headerActions) {
        const btn = document.createElement('button');
        btn.id = 'logout-btn';
        btn.className = 'btn btn-outline';
        btn.innerHTML = `<i class="fas fa-sign-out-alt"></i> ${currentUser}`;
        btn.onclick = () => {
            if (confirm(`Save progress for ${currentUser} and logout?`)) {
                saveProgress(currentUser);
                localStorage.removeItem('codecraft_current_user');
                location.reload();
            }
        };
        headerActions.appendChild(btn);
    }
}

// ============================================
// LESSONS DATA
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
            
            <p class="theory-text">Don't worry if this sounds complicated - it's actually much simpler than it seems. By the end of this lesson, you'll get knowledge.</p>
            
            <div class="tip-box">
                <div class="note-header">
                    <div class="note-icon tip-icon"><i class="fas fa-info-circle"></i></div>
                    <div class="note-title tip-title">Before We Start - Look at the Right Side of Your Screen</div>
                </div>
                <p class="theory-text">You see two boxes on the right? The top one is your <strong>Code Editor</strong> - this is where you'll type your code. The bottom one is <strong>Preview</strong> - this shows you what your web page looks like in real time. Every time you type something in the editor, the preview updates automatically.</p>
            </div>
        </div>

        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-question-circle"></i></div>
                <h2 class="section-title">So What Exactly is HTML?</h2>
            </div>
            
            <p class="theory-text">HTML stands for <strong>Hyper Text Markup Language</strong>. Sounds scary? Let's break it down:</p>
            
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
                <pre><code>&lt;name_of_the_tag&gt;Your content goes here&lt;/name_of_the_tag&gt;</code></pre>
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
            <p class="theory-text"><strong>The H2 Tag:</strong> This is a smaller heading, like a section title. If your page is a book, h1 is the book title and h2 are the chapter titles. You can have as many h2 tags as you want h3, h4, h5...</p>
            
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
            
            <p class="theory-text">If you look at the code editor on the right, you'll see a bunch of code already there. Most of it is just "setup code" that every web page needs. Let me quickly explain what you're seeing:</p>
            
            <p class="theory-text"><code>&lt;!DOCTYPE html&gt;</code> - This tells the browser "hey, this is an HTML document." Just leave it there.</p>
            
            <p class="theory-text"><code>&lt;html&gt;</code> - Everything on your page lives inside this tag. It's like the container for everything.</p>
            
            <p class="theory-text"><code>&lt;head&gt;</code> - This section contains invisible stuff - settings, the title, links to styles. Users don't see this part directly.</p>
            
            <p class="theory-text"><code>&lt;body&gt;</code> - This is where the main things happens! Everything you want people to SEE on your page goes in the body. This is where you'll be working today.</p>
            
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
                <div class="exercise-title"> Your Task Today: Create an "About Me" Page, very simple!</div>
            </div>
            <p class="theory-text">Alright, Now You're going to create a simple "About Me" page. Follow these steps exactly, and watch the preview update as you type. Do not try to remember everything, just comeback late and do the same lesson again, so you'll become use to it, You need time to adapt.</p>
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
                <div class="note-title">Congratulations!</div>
            </div>
            <p class="theory-text">Once you complete this, you'll have created your first real web page. Now you can create text document and rename it <strong>index.html</strong> and open it with a text editor. After you've pasted the code into it, open it with a browser by right-clicking, and your page will open in the browser.</p>
            <p><strong>See you next lesson!</strong></p>
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
            
            <p class="theory-text">Think about the last time you wrote a shopping list or a to-do list. You probably wrote items one below another, maybe with bullet points or numbers. It's organized, easy to read, and you can quickly see each item.</p>
            
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
            
            <p class="theory-text">For <em>italic text</em>, we use the <code>&lt;em&gt;</code> tag. "Em" stands for emphasis.</p>
            
            <div class="code-block">
                <div class="code-block-header">
                    <div class="code-block-title"><i class="fas fa-code"></i> Italic Text</div>
                    <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <pre><code>&lt;p&gt;You &lt;em&gt;really&lt;/em&gt; need to try this recipe.&lt;/p&gt;</code></pre>
            </div>
            
            <p class="theory-text">Exemple: You <em>really</em> need to try this recipe.</p>
            
            <div class="note-box">
                <div class="note-header">
                    <div class="note-icon"><i class="fas fa-lightbulb"></i></div>
                    <div class="note-title">How It Works</div>
                </div>
                <p class="theory-text">Notice that <code>&lt;strong&gt;</code> and <code>&lt;em&gt;</code> go INSIDE your paragraph tags. You're not replacing the <code>&lt;p&gt;</code> tag - you're adding formatting to specific words within it. It's like highlighting certain words in a sentence you've already written.</p>
            </div>
        </div>
        
        <p class="theory-text">Also you can try both &lt;p&gt; and &lt;em&gt;: <em><strong>Storng and Itallic</strong></em></p>

                 <div class="code-block">
                <div class="code-block-header">
                    <div class="code-block-title"><i class="fas fa-code"></i> Italic Text</div>
                    <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <pre><h6><code></code>This is how it should looks like: &lt;em&gt;&lt;strong&gt; Your text inside! &lt;/strong&gt;&lt;/em&gt;</h6>
                <h6>the order of &lt;strong&gt; and &lt;em&gt; should be only this way other wise it will not work!</h6></pre>
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
            
            <p class="theory-text">See how it all connects?</p>
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
                <div class="note-title">Good Job!</div>
            </div>
            <p class="theory-text">Next lesson is in procces</p>
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
            <h2 class="section-title">What Are Links?</h2>
        </div>
        <p class="theory-text">Links (also called "hyperlinks") are clickable text or images that take you to another webpage, file, or even send an email. Think of them as doors that lead somewhere else.</p>
        <p class="theory-text">In HTML, we make links using the <code>&lt;a&gt;</code> tag. The <code>a</code> stands for <strong>anchor</strong>.</p>
        
        <div class="code-block">
            <div class="code-block-header">
                <div class="code-block-title"><i class="fas fa-code"></i> Exeple: Basic Link</div>
                <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
            </div>
            <pre><code>&lt;a href="https://google.com"&gt;Click here to visit Google&lt;/a&gt;</code></pre>
        </div>
        
        <div class="note-box">
            <div class="note-header">
                <div class="note-icon"><i class="fas fa-puzzle-piece"></i></div>
                <div class="note-title">Breaking it down</div>
            </div>
            <ul class="theory-list">
                <li><code>&lt;a&gt;</code> – the link container</li>
                <li><code>href="your link here"</code> – the destination address (like a URL)</li>
                <li>The text between <code>&lt;a&gt;</code> and <code>&lt;/a&gt;</code> – what the user sees and clicks</li>
            </ul>
        </div>

        <div class="code-block">
            <div class="code-block-header">
                <div class="code-block-title"><i class="fas fa-code"></i> Open in a New Tab</div>
                <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
            </div>
            <pre><code>&lt;a href="https://google.com" target="_blank"&gt;Google (new tab)&lt;/a&gt;</code></pre>
            <p class="theory-text"><code>target="_blank"</code> tells the browser to open the link in a fresh tab.</p>
        </div>
    </div>

    <div class="theory-section">
        <div class="section-header">
            <div class="section-icon"><i class="fas fa-image"></i></div>
            <h2 class="section-title">Adding Images</h2>
        </div>
        <p class="theory-text">Images make your page look great! Use the <code>&lt;img&gt;</code> tag. Unlike most tags, it doesn't need a closing tag – it's self-closing.</p>
        
        <div class="code-block">
            <div class="code-block-header">
                <div class="code-block-title"><i class="fas fa-code"></i> Image Example</div>
                <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
            </div>
            <pre><code>&lt;img src="https://picsum.photos/300/200" alt="A random landscape"&gt;</code></pre>
        </div>
        
        <div class="note-box">
            <div class="note-header">
                <div class="note-icon"><i class="fas fa-tag"></i></div>
                <div class="note-title">Image Attributes (settings)</div>
            </div>
            <ul class="theory-list">
                <li><code>src</code> – the image source (where the image lives). Can be a web address or a local file.</li>
                <li><code>alt</code> – alternative text describing the image. Important for accessibility (screen readers) and shows if the image fails to load. <strong>Always include it!</strong></li>
            </ul>
        </div>
        
        <div class="tip-box">
            <div class="note-header">
                <div class="note-icon tip-icon"><i class="fas fa-camera"></i></div>
                <div class="note-title tip-title">Free Practice Images</div>
            </div>
            <p class="theory-text">Use <code>https://picsum.photos/200/150</code> to get a random photo. The numbers are width and height. For a square, just use one number: <code>https://picsum.photos/150</code>.</p>
        </div>
    </div>

    <div class="theory-section">
        <div class="section-header">
            <div class="section-icon"><i class="fas fa-envelope"></i></div>
            <h2 class="section-title">Email Links</h2>
        </div>
        <p class="theory-text">Want a link that opens the user's email program? Use <code>mailto:</code> inside <code>href</code>.</p>
        
        <div class="code-block">
            <div class="code-block-header">
                <div class="code-block-title"><i class="fas fa-code"></i> Email Link</div>
                <button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button>
            </div>
            <pre><code>&lt;a href="mailto:hello@example.com"&gt;Send me an email&lt;/a&gt;</code></pre>
            <p class="theory-text">Clicking this will open the default email app with "hello@example.com" in the "To" field.</p>
        </div>
    </div>

    <div class="exercise-box">
        <div class="exercise-header">
            <div class="exercise-icon"><i class="fas fa-pencil-alt"></i></div>
            <div class="exercise-title"> Your Mission: Build a Profile Card</div>
        </div>
        <p class="theory-text">Now you'll create a small profile card that includes an image, your name, a short bio, a link to a website, and an email link. Follow the steps below. Don't worry if it's not perfect – just try!</p>
    </div>

    <div class="step-by-step">
        <div class="step">
            <div class="step-number">Step 1</div>
            <div class="step-content">
                <h4>Add a Profile Picture</h4>
                <p>Find the comment <code>&lt;!-- STEP 1 --&gt;</code> in the code editor. Right after it, type:</p>
                <div class="code-inline">&lt;img src="https://picsum.photos/150" alt="My profile photo"&gt;</div>
            </div>
        </div>
        
        <div class="step">
            <div class="step-number">Step 2</div>
            <div class="step-content">
                <h4>Write Your Name</h4>
                <p>Under <code>&lt;!-- STEP 2 --&gt;</code>, add your name inside <code>&lt;h1&gt;</code> tags:</p>
                <div class="code-inline">&lt;h1&gt;Alex Johnson&lt;/h1&gt;</div>
                <p>(Replace "Alex Johnson" with your own name, or any name you like.)</p>
            </div>
        </div>
        
        <div class="step">
            <div class="step-number">Step 3</div>
            <div class="step-content">
                <h4>Write a Short Bio</h4>
                <p>Under <code>&lt;!-- STEP 3 --&gt;</code>, create a paragraph using <code>&lt;p&gt;</code>:</p>
                <div class="code-inline">&lt;p&gt;I'm learning HTML and loving it!&lt;/p&gt;</div>
            </div>
        </div>
        
        <div class="step">
            <div class="step-number">Step 4</div>
            <div class="step-content">
                <h4>Add a Website Link</h4>
                <p>Inside the <code>&lt;div class="links"&gt;</code> section, find <code>&lt;!-- STEP 4 --&gt;</code> and add a link:</p>
                <div class="code-inline">&lt;a href="https://github.com"&gt;My GitHub&lt;/a&gt;</div>
                <p>You can change the URL and text to whatever you want.</p>
            </div>
        </div>
        
        <div class="step">
            <div class="step-number">Step 5</div>
            <div class="step-content">
                <h4>Add an Email Link</h4>
                <p>Under <code>&lt;!-- STEP 5 --&gt;</code>, add a <code>mailto:</code> link:</p>
                <div class="code-inline">&lt;a href="mailto:hello@example.com"&gt;Contact Me&lt;/a&gt;</div>
            </div>
        </div>
    </div>

    <div class="theory-section" style="margin-top: 30px; background: #004f8b; border-left: 5px solid #074475; padding: 20px; border-radius: 12px;">
        <div class="section-header">
            <div class="section-icon"><i class="fas fa-clipboard-check"></i></div>
            <h2 class="section-title"> What You've Accomplished</h2>
        </div>
        <ul class="theory-list" style="font-size: 1.1rem;">
            <li> Created a clickable link using <code>&lt;a&gt;</code> and <code>href</code></li>
            <li> Added an image with <code>&lt;img&gt;</code>, including <code>src</code> and <code>alt</code></li>
            <li> Made an email link with <code>mailto:</code></li>
            <li> Built a small profile card with multiple elements</li>
            <li> Saw how CSS (already provided) makes it look nice</li>
        </ul>
        <p class="theory-text" style="margin-top: 15px;"><strong>Next step:</strong> Click "Submit Solution" to check your work. You'll see a checklist of what you did right. If something is missing, you can go back and fix it. Great job!</p>
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
// LESSON 4: Semantic HTML  — INTERACTIVE
// ==========================================
'html-semantic': {
    title: 'Page Layout with Semantic HTML',
    subtitle: 'Play a game, then build a real page — structure matters!',
    difficulty: 'Beginner',
    duration: '25 minutes',
    theory: `
<!-- ═══════════════════════════════════════
     STAGE 1 — THEORY
═══════════════════════════════════════ -->
<div class="theory-section">
    <div class="section-header">
        <div class="section-icon"><i class="fas fa-sitemap"></i></div>
        <h2 class="section-title">What is Semantic HTML?</h2>
    </div>
    <p class="theory-text">Until now you've used <code>&lt;h1&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;a&gt;</code> — tags that describe <em>what content looks like</em>. Semantic HTML goes one step further: tags that describe <em>what the content IS</em> and <em>where it lives</em> on the page.</p>
    <p class="theory-text">Instead of wrapping everything in a generic <code>&lt;div&gt;</code>, you use purpose-built containers:</p>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin:20px 0;">
        <div style="background:rgba(124,58,237,0.15); border:1px solid rgba(124,58,237,0.4); border-radius:12px; padding:14px;">
            <div style="font-family:monospace; font-size:1rem; color:#a78bfa; font-weight:700;">&lt;header&gt;</div>
            <div style="color:#cbd5e1; font-size:0.85rem; margin-top:4px;">Top of page — logo, site name</div>
        </div>
        <div style="background:rgba(8,145,178,0.15); border:1px solid rgba(8,145,178,0.4); border-radius:12px; padding:14px;">
            <div style="font-family:monospace; font-size:1rem; color:#67e8f9; font-weight:700;">&lt;nav&gt;</div>
            <div style="color:#cbd5e1; font-size:0.85rem; margin-top:4px;">Navigation links menu</div>
        </div>
        <div style="background:rgba(5,150,105,0.15); border:1px solid rgba(5,150,105,0.4); border-radius:12px; padding:14px;">
            <div style="font-family:monospace; font-size:1rem; color:#6ee7b7; font-weight:700;">&lt;main&gt;</div>
            <div style="color:#cbd5e1; font-size:0.85rem; margin-top:4px;">The main content (one per page!)</div>
        </div>
        <div style="background:rgba(217,119,6,0.15); border:1px solid rgba(217,119,6,0.4); border-radius:12px; padding:14px;">
            <div style="font-family:monospace; font-size:1rem; color:#fcd34d; font-weight:700;">&lt;article&gt;</div>
            <div style="color:#cbd5e1; font-size:0.85rem; margin-top:4px;">Self-contained block (blog post, card)</div>
        </div>
        <div style="background:rgba(220,38,38,0.15); border:1px solid rgba(220,38,38,0.4); border-radius:12px; padding:14px; grid-column: 1 / -1; max-width:50%;">
            <div style="font-family:monospace; font-size:1rem; color:#fca5a5; font-weight:700;">&lt;footer&gt;</div>
            <div style="color:#cbd5e1; font-size:0.85rem; margin-top:4px;">Bottom of page — copyright, links</div>
        </div>
    </div>

    <div class="tip-box">
        <div class="note-header"><div class="note-icon tip-icon"><i class="fas fa-newspaper"></i></div><div class="note-title tip-title">Think of a newspaper</div></div>
        <p class="theory-text"><i class="fas fa-newspaper"></i> The masthead at the top = <code>&lt;header&gt;</code> &nbsp;|&nbsp; Sections menu = <code>&lt;nav&gt;</code> &nbsp;|&nbsp; Main story = <code>&lt;main&gt;</code> → <code>&lt;article&gt;</code> &nbsp;|&nbsp; Fine print at bottom = <code>&lt;footer&gt;</code></p>
    </div>

    <div class="note-box">
        <div class="note-header"><div class="note-icon"><i class="fas fa-question-circle"></i></div><div class="note-title">Why bother?</div></div>
        <p class="theory-text"><i class="fas fa-search"></i> <strong>Google</strong> understands your page → better search ranking<br><i class="fas fa-wheelchair"></i> <strong>Screen readers</strong> can navigate it → accessible for blind users<br><i class="fas fa-laptop-code"></i> <strong>Other developers</strong> instantly understand your code</p>
    </div>
</div>

<!-- ═══════════════════════════════════════
     STAGE 2 — INTERACTIVE GAME
═══════════════════════════════════════ -->
<div style="background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); border-radius: 20px; padding: 28px; margin: 28px 0; border: 1px solid rgba(165,180,252,0.2);">

    <div style="display:flex; align-items:center; gap:12px; margin-bottom:6px;">
        <div style="background:#f59e0b; border-radius:10px; width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:1.2rem;"><i class="fas fa-gamepad"></i></div>
        <h2 style="color:#fbbf24; margin:0; font-size:1.3rem;">Stage 2 — Fix the Broken Website!</h2>
    </div>
    <p style="color:#c7d2fe; margin:0 0 20px; font-size:0.95rem;">A developer used <code style="background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px;">&lt;div&gt;</code> for everything. Drag each correct semantic tag onto the broken section. Earn <i class="fas fa-star" style="color:#f59e0b;"></i> for every correct placement!</p>

    <!-- Scoreboard -->
    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); border-radius:12px; padding:12px 16px; margin-bottom:16px;">
        <div id="sem-stars" style="font-size:1.2rem; display:flex; gap:4px; align-items:center;"><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i></div>
        <div id="sem-msg" style="color:#a5b4fc; font-size:0.9rem;">0 / 5 correct</div>
        <button onclick="resetSemanticGame()" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#cbd5e1; padding:6px 14px; border-radius:8px; cursor:pointer; font-size:0.8rem;">↺ Reset</button>
    </div>

    <!-- Tag Toolbox -->
    <div id="sem-toolbox" style="display:flex; flex-wrap:wrap; gap:10px; padding:14px; background:rgba(255,255,255,0.05); border-radius:12px; margin-bottom:16px;">
        <div style="color:#64748b; font-size:0.75rem; width:100%; margin-bottom:2px;"><i class="fas fa-toolbox"></i> Drag these tags onto the correct zones:</div>
        <div class="sem-tag" draggable="true" data-tag="header"  style="cursor:grab; background:#7c3aed; color:white; padding:8px 18px; border-radius:8px; font-family:monospace; font-weight:700; user-select:none; transition:transform 0.15s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">&lt;header&gt;</div>
        <div class="sem-tag" draggable="true" data-tag="nav"     style="cursor:grab; background:#0891b2; color:white; padding:8px 18px; border-radius:8px; font-family:monospace; font-weight:700; user-select:none; transition:transform 0.15s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">&lt;nav&gt;</div>
        <div class="sem-tag" draggable="true" data-tag="main"    style="cursor:grab; background:#059669; color:white; padding:8px 18px; border-radius:8px; font-family:monospace; font-weight:700; user-select:none; transition:transform 0.15s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">&lt;main&gt;</div>
        <div class="sem-tag" draggable="true" data-tag="article" style="cursor:grab; background:#d97706; color:white; padding:8px 18px; border-radius:8px; font-family:monospace; font-weight:700; user-select:none; transition:transform 0.15s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">&lt;article&gt;</div>
        <div class="sem-tag" draggable="true" data-tag="footer"  style="cursor:grab; background:#dc2626; color:white; padding:8px 18px; border-radius:8px; font-family:monospace; font-weight:700; user-select:none; transition:transform 0.15s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">&lt;footer&gt;</div>
    </div>

    <!-- Broken Page Mock-up -->
    <div style="border: 2px solid rgba(255,255,255,0.1); border-radius:14px; overflow:hidden; font-size:0.9rem;">

        <!-- Zone: header -->
        <div class="sem-zone" data-answer="header"
             style="background:rgba(220,38,38,0.15); border-bottom:1px solid rgba(255,255,255,0.08); padding:18px 20px; transition:all 0.3s;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div>
                    <span style="font-family:monospace; color:#f87171; font-size:0.8rem; display:block; margin-bottom:4px;">&lt;div id="top"&gt; <i class="fas fa-times-circle"></i> wrong tag!</span>
                    <span style="color:#e2e8f0; font-size:1.1rem; font-weight:700;"><i class="fas fa-globe"></i> MySite — Best Website Ever</span>
                </div>
                <div class="sem-drop-hint" style="color:#94a3b8; font-size:0.8rem; font-style:italic; border:1px dashed rgba(148,163,184,0.4); padding:6px 12px; border-radius:8px;">Drop correct tag here <i class="fas fa-arrow-down"></i></div>
            </div>
        </div>

        <!-- Zone: nav -->
        <div class="sem-zone" data-answer="nav"
             style="background:rgba(245,158,11,0.1); border-bottom:1px solid rgba(255,255,255,0.08); padding:14px 20px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; transition:all 0.3s;">
            <span style="font-family:monospace; color:#fb923c; font-size:0.8rem;">&lt;div id="menu"&gt; <i class="fas fa-times-circle"></i></span>
            <span style="color:#cbd5e1;">Home</span>
            <span style="color:#cbd5e1;">About</span>
            <span style="color:#cbd5e1;">Portfolio</span>
            <span style="color:#cbd5e1;">Contact</span>
            <div class="sem-drop-hint" style="margin-left:auto; color:#94a3b8; font-size:0.8rem; font-style:italic; border:1px dashed rgba(148,163,184,0.4); padding:6px 12px; border-radius:8px;">Drop here <i class="fas fa-arrow-down"></i></div>
        </div>

        <!-- Zone: main -->
        <div class="sem-zone" data-answer="main"
             style="background:rgba(5,150,105,0.08); border-bottom:1px solid rgba(255,255,255,0.08); padding:18px 20px; transition:all 0.3s;">
            <span style="font-family:monospace; color:#86efac; font-size:0.8rem; display:block; margin-bottom:8px;">&lt;div id="content"&gt; <i class="fas fa-times-circle"></i></span>
            <div style="color:#94a3b8; font-size:0.85rem; font-style:italic;">[ The main content of the page lives here ]</div>
            <div class="sem-drop-hint" style="display:inline-block; margin-top:10px; color:#94a3b8; font-size:0.8rem; font-style:italic; border:1px dashed rgba(148,163,184,0.4); padding:6px 12px; border-radius:8px;">This is the primary page content — Drop here <i class="fas fa-arrow-down"></i></div>
        </div>

        <!-- Zone: article (indented = inside main) -->
        <div class="sem-zone" data-answer="article"
             style="background:rgba(217,119,6,0.08); border-bottom:1px solid rgba(255,255,255,0.08); padding:18px 20px 18px 44px; transition:all 0.3s;">
            <span style="font-family:monospace; color:#fcd34d; font-size:0.8rem; display:block; margin-bottom:6px;">&lt;div class="post"&gt; <i class="fas fa-times-circle"></i> ← nested inside main</span>
            <div style="color:#e2e8f0; font-weight:600;"><i class="fas fa-file-alt"></i> How I Built My First Website</div>
            <div style="color:#94a3b8; font-size:0.85rem; margin-top:4px;">A self-contained blog post — it could be picked up and published anywhere</div>
            <div class="sem-drop-hint" style="display:inline-block; margin-top:10px; color:#94a3b8; font-size:0.8rem; font-style:italic; border:1px dashed rgba(148,163,184,0.4); padding:6px 12px; border-radius:8px;">Drop here <i class="fas fa-arrow-down"></i></div>
        </div>

        <!-- Zone: footer -->
        <div class="sem-zone" data-answer="footer"
             style="background:rgba(99,102,241,0.1); padding:16px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; transition:all 0.3s;">
            <span style="font-family:monospace; color:#a5b4fc; font-size:0.8rem;">&lt;div id="bottom"&gt; <i class="fas fa-times-circle"></i></span>
            <span style="color:#cbd5e1; font-size:0.85rem;">© 2026 BS. All rights reserved.</span>
            <div class="sem-drop-hint" style="color:#94a3b8; font-size:0.8rem; font-style:italic; border:1px dashed rgba(148,163,184,0.4); padding:6px 12px; border-radius:8px;">Drop here <i class="fas fa-arrow-down"></i></div>
        </div>
    </div>

    <!-- Celebration banner (hidden initially) -->
    <div id="sem-win" style="display:none; margin-top:16px; background:linear-gradient(135deg,#065f46,#047857); border-radius:12px; padding:16px 20px; text-align:center; color:#d1fae5; font-size:1rem; font-weight:600;">
        <i class="fas fa-trophy"></i> Perfect score! All 5 tags correct! Now complete the code challenge on the right →
    </div>
</div>

<!-- Drag & Drop Script (scoped, runs once) -->
<script>
(function initSemanticGame() {
    let score = 0;
    const TOTAL = 5;
    let dragging = null;

    function render() {
        const starFull  = '<i class="fas fa-star" style="color:#f59e0b;font-size:1.1rem;"></i>';
        const starEmpty = '<i class="far fa-star" style="color:rgba(255,255,255,0.25);font-size:1.1rem;"></i>';
        const stars = starFull.repeat(score) + starEmpty.repeat(TOTAL - score);
        document.getElementById('sem-stars').innerHTML = stars;
        document.getElementById('sem-msg').textContent = score + ' / ' + TOTAL + ' correct';
        if (score === TOTAL) {
            document.getElementById('sem-win').style.display = 'block';
        }
    }

    function bindTags() {
        document.querySelectorAll('.sem-tag').forEach(tag => {
            tag.addEventListener('dragstart', e => {
                dragging = tag.dataset.tag;
                setTimeout(() => tag.style.opacity = '0.4', 0);
            });
            tag.addEventListener('dragend', () => { tag.style.opacity = '1'; });
        });
    }

    function bindZones() {
        document.querySelectorAll('.sem-zone').forEach(zone => {
            zone.addEventListener('dragover', e => {
                e.preventDefault();
                if (!zone.dataset.answered) zone.style.boxShadow = '0 0 0 2px #a5b4fc inset';
            });
            zone.addEventListener('dragleave', () => { zone.style.boxShadow = ''; });
            zone.addEventListener('drop', e => {
                e.preventDefault();
                zone.style.boxShadow = '';
                if (zone.dataset.answered) return;

                const hint = zone.querySelector('.sem-drop-hint');
                if (dragging === zone.dataset.answer) {
                    // Correct!
                    zone.style.background = 'rgba(34,197,94,0.2)';
                    zone.style.borderLeft = '4px solid #4ade80';
                    if (hint) {
                        hint.style.background = 'rgba(34,197,94,0.25)';
                        hint.style.border = '1px solid #4ade80';
                        hint.style.color = '#4ade80';
                        hint.innerHTML = '<i class="fas fa-check-circle"></i> &lt;' + dragging + '&gt; — correct!';
                    }
                    // Hide the used tag
                    const used = document.querySelector('.sem-tag[data-tag="' + dragging + '"]');
                    if (used) { used.style.opacity = '0.3'; used.style.pointerEvents = 'none'; used.draggable = false; }
                    zone.dataset.answered = 'true';
                    score++;
                    render();
                } else {
                    // Wrong
                    const prevBg = zone.style.background;
                    zone.style.background = 'rgba(239,68,68,0.25)';
                    if (hint) { hint.innerHTML = '<i class="fas fa-times-circle"></i> Not quite — try a different tag!'; }
                    setTimeout(() => {
                        zone.style.background = prevBg;
                        if (hint && !zone.dataset.answered) hint.innerHTML = 'Drop here <i class="fas fa-arrow-down"></i>';
                    }, 1400);
                }
            });
        });
    }

    window.resetSemanticGame = function() {
        score = 0;
        document.getElementById('sem-win').style.display = 'none';
        render();
        // Restore tags
        document.querySelectorAll('.sem-tag').forEach(t => { t.style.opacity='1'; t.style.pointerEvents='auto'; t.draggable=true; });
        // Restore zones
        document.querySelectorAll('.sem-zone').forEach(z => {
            delete z.dataset.answered;
            z.style.background = '';
            z.style.borderLeft = '';
            const h = z.querySelector('.sem-drop-hint');
            if (h) { h.style.background=''; h.style.border='1px dashed rgba(148,163,184,0.4)'; h.style.color='#94a3b8'; h.innerHTML='Drop here <i class="fas fa-arrow-down"></i>'; }
        });
    };

    bindTags();
    bindZones();
    render();
})();
</script>

<!-- ═══════════════════════════════════════
     STAGE 3 — CODE CHALLENGE
═══════════════════════════════════════ -->
<div class="exercise-box" style="margin-top:28px;">
    <div class="exercise-header">
        <div class="exercise-icon"><i class="fas fa-keyboard"></i></div>
        <div class="exercise-title">Stage 3 — Now Type It! Build the Same Layout in Code</div>
    </div>
    <p class="theory-text">You just placed the tags visually. Now type them in the code editor on the right. Follow the 4 steps in the comments.</p>
</div>

<div class="step-by-step">
    <div class="step">
        <div class="step-number">1</div>
        <div class="step-content">
            <h4>Header + Nav</h4>
            <p>Find <code>&lt;!-- STEP 1 & 2 --&gt;</code> and add:</p>
            <div class="code-inline">&lt;header&gt;
  &lt;h1&gt;My Awesome Website&lt;/h1&gt;
  &lt;nav&gt;
    &lt;a href="#home"&gt;Home&lt;/a&gt;
    &lt;a href="#about"&gt;About&lt;/a&gt;
    &lt;a href="#contact"&gt;Contact&lt;/a&gt;
  &lt;/nav&gt;
&lt;/header&gt;</div>
            <p><em>Notice: <code>&lt;nav&gt;</code> goes <strong>inside</strong> <code>&lt;header&gt;</code>!</em></p>
        </div>
    </div>

    <div class="step">
        <div class="step-number">2</div>
        <div class="step-content">
            <h4>Main + Article</h4>
            <p>Find <code>&lt;!-- STEP 3 --&gt;</code> and add:</p>
            <div class="code-inline">&lt;main&gt;
  &lt;article&gt;
    &lt;h2&gt;Welcome to my site!&lt;/h2&gt;
    &lt;p&gt;I'm learning HTML and having a blast.&lt;/p&gt;
  &lt;/article&gt;
&lt;/main&gt;</div>
            <p><em><code>&lt;article&gt;</code> goes <strong>inside</strong> <code>&lt;main&gt;</code>.</em></p>
        </div>
    </div>

    <div class="step">
        <div class="step-number">3</div>
        <div class="step-content">
            <h4>Footer</h4>
            <p>Find <code>&lt;!-- STEP 4 --&gt;</code> and add:</p>
            <div class="code-inline">&lt;footer&gt;
  &lt;p&gt;&amp;copy; 2026 My Website. All rights reserved.&lt;/p&gt;
&lt;/footer&gt;</div>
            <p><em><code>&amp;copy;</code> is the HTML code for the © symbol — cool trick!</em></p>
        </div>
    </div>

    <div class="step">
        <div class="step-number">4</div>
        <div class="step-content">
            <h4>Check your structure</h4>
            <p>Your page should be structured like this — everything in the right place:</p>
            <div class="code-inline">&lt;body&gt;
  &lt;header&gt;
    &lt;h1&gt;...&lt;/h1&gt;
    &lt;nav&gt;...&lt;/nav&gt;
  &lt;/header&gt;
  &lt;main&gt;
    &lt;article&gt;...&lt;/article&gt;
  &lt;/main&gt;
  &lt;footer&gt;...&lt;/footer&gt;
&lt;/body&gt;</div>
            <p><em>Click <strong>Submit</strong> when ready — the validator checks all 5 semantic tags!</em></p>
        </div>
    </div>
</div>

<div class="tip-box" style="margin-top:1.5rem;">
    <div class="note-header"><div class="note-icon tip-icon"><i class="fas fa-check-circle"></i></div><div class="note-title tip-title">What gets checked</div></div>
    <p class="theory-text">✓ <code>&lt;header&gt;</code> exists &nbsp; ✓ <code>&lt;nav&gt;</code> with links &nbsp; ✓ <code>&lt;main&gt;</code> exists &nbsp; ✓ <code>&lt;article&gt;</code> inside main &nbsp; ✓ <code>&lt;footer&gt;</code> exists</p>
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

    <!-- STEP 1 & 2: Add <header> with <h1> and <nav> inside -->


    <!-- STEP 3: Add <main> with <article> inside -->


    <!-- STEP 4: Add <footer> -->


</body>
</html>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }

header {
    background: linear-gradient(135deg, #2c3e50, #3498db);
    color: white;
    padding: 20px 40px;
}
header h1 { font-size: 1.8rem; margin-bottom: 15px; }

nav { display: flex; gap: 20px; }
nav a { color: rgba(255,255,255,0.9); text-decoration: none; padding: 8px 16px; border-radius: 5px; transition: background 0.3s; }
nav a:hover { background: rgba(255,255,255,0.2); }

main { max-width: 800px; margin: 40px auto; padding: 0 20px; }

article { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
article h2 { color: #2c3e50; margin-bottom: 15px; }
article p { color: #666; }

footer { background: #2c3e50; color: rgba(255,255,255,0.8); text-align: center; padding: 25px; margin-top: 40px; }`,
        js: `// No JavaScript needed`
    },
    hints: [
        "• Start with <header>, put your <h1> title inside, then add <nav> with 3 links, close </header>",
        "• Nav goes INSIDE header: <header> <h1>...</h1> <nav>...</nav> </header>",
        "• Main wraps article: <main> <article> <h2>...</h2> <p>...</p> </article> </main>",
        "• Footer is OUTSIDE main: </main> then <footer><p>...</p></footer>",
        "• Check nesting — every opening tag needs a closing tag in the right place!"
    ],
    validation: (code) => {
        const checks = [];
        checks.push({ passed: /<header>[\s\S]*<\/header>/i.test(code.html), message: '✓ Added <header> element' });
        checks.push({ passed: /<nav>[\s\S]*<a[\s\S]*<\/nav>/i.test(code.html), message: '✓ Added <nav> with links inside' });
        checks.push({ passed: /<main>[\s\S]*<\/main>/i.test(code.html), message: '✓ Added <main> element' });
        checks.push({ passed: /<article>[\s\S]*<\/article>/i.test(code.html), message: '✓ Added <article> element' });
        checks.push({ passed: /<footer>[\s\S]*<\/footer>/i.test(code.html), message: '✓ Added <footer> element' });
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
            <p class="theory-text">Every time you log in, sign up, search Google, or send a message — you're using an HTML <strong>form</strong>. Forms collect information from users and send it somewhere.</p>
            <p class="theory-text">The <code>&lt;form&gt;</code> tag wraps everything. Inside it you place inputs, dropdowns, text areas, and buttons.</p>
            <div class="code-block">
                <div class="code-block-header"><div class="code-block-title"><i class="fas fa-code"></i> Form Skeleton</div><button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
                <pre><code>&lt;form action="#" method="POST"&gt;
    &lt;!-- inputs go here --&gt;
    &lt;button type="submit"&gt;Send&lt;/button&gt;
&lt;/form&gt;</code></pre>
            </div>
            <div class="tip-box">
                <div class="note-header"><div class="note-icon tip-icon"><i class="fas fa-info-circle"></i></div><div class="note-title tip-title">Why labels matter</div></div>
                <p class="theory-text">Every input needs a <code>&lt;label&gt;</code>. The <code>for</code> attribute on the label must match the <code>id</code> on the input — this lets screen readers announce what each field is, and lets users click the label to focus the input.</p>
            </div>
        </div>

        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-keyboard"></i></div>
                <h2 class="section-title">Text & Email Inputs</h2>
            </div>
            <p class="theory-text">The <code>&lt;input&gt;</code> tag creates a single-line text field. Change the <code>type</code> attribute to get different behaviors:</p>
            <div class="code-block">
                <div class="code-block-header"><div class="code-block-title"><i class="fas fa-code"></i> Label + Text Input</div><button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
                <pre><code>&lt;label for="name"&gt;Your Name:&lt;/label&gt;
&lt;input type="text" id="name" name="name" placeholder="John Doe"&gt;</code></pre>
            </div>
            <div class="code-block">
                <div class="code-block-header"><div class="code-block-title"><i class="fas fa-code"></i> Email Input (validates @ automatically)</div><button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
                <pre><code>&lt;label for="email"&gt;Email:&lt;/label&gt;
&lt;input type="email" id="email" name="email" placeholder="you@example.com"&gt;</code></pre>
            </div>
            <div class="note-box">
                <div class="note-header"><div class="note-icon"><i class="fas fa-lightbulb"></i></div><div class="note-title">The name attribute</div></div>
                <p class="theory-text"><code>name="email"</code> is the key that gets sent to the server. Without it the data won't be submitted! Think of it as a label on an envelope — it tells the server which value is which.</p>
            </div>
        </div>

        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-caret-square-down"></i></div>
                <h2 class="section-title">Dropdowns with &lt;select&gt;</h2>
            </div>
            <p class="theory-text">When you want users to pick from a fixed list of choices, use <code>&lt;select&gt;</code> with <code>&lt;option&gt;</code> tags inside:</p>
            <div class="code-block">
                <div class="code-block-header"><div class="code-block-title"><i class="fas fa-code"></i> Select Dropdown</div><button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
                <pre><code>&lt;label for="subject"&gt;Subject:&lt;/label&gt;
&lt;select id="subject" name="subject"&gt;
    &lt;option value=""&gt;-- Choose a topic --&lt;/option&gt;
    &lt;option value="general"&gt;General Inquiry&lt;/option&gt;
    &lt;option value="support"&gt;Technical Support&lt;/option&gt;
    &lt;option value="feedback"&gt;Feedback&lt;/option&gt;
&lt;/select&gt;</code></pre>
            </div>
            <p class="theory-text">The first <code>&lt;option&gt;</code> with an empty <code>value=""</code> acts as a placeholder — it shows "Choose a topic" but counts as nothing selected.</p>
        </div>

        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-align-left"></i></div>
                <h2 class="section-title">Multi-line Text with &lt;textarea&gt;</h2>
            </div>
            <p class="theory-text">Unlike <code>&lt;input&gt;</code>, a <code>&lt;textarea&gt;</code> lets users type multiple lines — perfect for messages, comments, or descriptions.</p>
            <div class="code-block">
                <div class="code-block-header"><div class="code-block-title"><i class="fas fa-code"></i> Textarea</div><button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
                <pre><code>&lt;label for="message"&gt;Your Message:&lt;/label&gt;
&lt;textarea id="message" name="message" rows="5" placeholder="Write your message here..."&gt;&lt;/textarea&gt;</code></pre>
            </div>
            <div class="note-box">
                <div class="note-header"><div class="note-icon"><i class="fas fa-lightbulb"></i></div><div class="note-title">rows attribute</div></div>
                <p class="theory-text"><code>rows="5"</code> sets how tall the textarea appears initially. Users can still type more — it'll scroll. You can also use CSS to control the exact height.</p>
            </div>
        </div>

        <div class="theory-section">
            <div class="section-header">
                <div class="section-icon"><i class="fas fa-paper-plane"></i></div>
                <h2 class="section-title">The Submit Button</h2>
            </div>
            <p class="theory-text">Every form needs a way to send the data. The submit button triggers the form's action:</p>
            <div class="code-block">
                <div class="code-block-header"><div class="code-block-title"><i class="fas fa-code"></i> Submit Button</div><button class="copy-code" onclick="copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div>
                <pre><code>&lt;button type="submit"&gt;Send Message&lt;/button&gt;</code></pre>
            </div>
        </div>

        <div class="exercise-box">
            <div class="exercise-header">
                <div class="exercise-icon"><i class="fas fa-pencil-alt"></i></div>
                <div class="exercise-title">Your Task: Build a Contact Form</div>
            </div>
            <p class="theory-text">Create a real contact form with a name field, email field, subject dropdown, message area, and a submit button. Follow the 5 steps below — type the code inside each <code>&lt;div class="form-group"&gt;</code> in the editor.</p>
        </div>

        <div class="step-by-step">
            <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>Name Input</h4>
                    <p>Find <code>&lt;!-- STEP 1 --&gt;</code> and add a label + text input inside the form-group:</p>
                    <div class="code-inline">&lt;label for="name"&gt;Your Name:&lt;/label&gt;
&lt;input type="text" id="name" name="name" placeholder="John Doe"&gt;</div>
                    <p><em>The <code>for="name"</code> connects the label to <code>id="name"</code> on the input.</em></p>
                </div>
            </div>

            <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>Email Input</h4>
                    <p>Find <code>&lt;!-- STEP 2 --&gt;</code> and add the same pattern but with <code>type="email"</code>:</p>
                    <div class="code-inline">&lt;label for="email"&gt;Email Address:&lt;/label&gt;
&lt;input type="email" id="email" name="email" placeholder="you@example.com"&gt;</div>
                    <p><em>Using <code>type="email"</code> makes the browser check for a valid email format automatically!</em></p>
                </div>
            </div>

            <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Subject Dropdown</h4>
                    <p>Find <code>&lt;!-- STEP 3 --&gt;</code> and add a label + select with at least 3 options:</p>
                    <div class="code-inline">&lt;label for="subject"&gt;Subject:&lt;/label&gt;
&lt;select id="subject" name="subject"&gt;
    &lt;option value=""&gt;-- Choose a topic --&lt;/option&gt;
    &lt;option value="general"&gt;General Inquiry&lt;/option&gt;
    &lt;option value="support"&gt;Technical Support&lt;/option&gt;
    &lt;option value="feedback"&gt;Feedback&lt;/option&gt;
&lt;/select&gt;</div>
                    <p><em>The first <code>&lt;option value=""&gt;</code> is a placeholder — it shows a prompt but doesn't count as a real choice.</em></p>
                </div>
            </div>

            <div class="step">
                <div class="step-number">4</div>
                <div class="step-content">
                    <h4>Message Textarea</h4>
                    <p>Find <code>&lt;!-- STEP 4 --&gt;</code> and add a label + textarea:</p>
                    <div class="code-inline">&lt;label for="message"&gt;Your Message:&lt;/label&gt;
&lt;textarea id="message" name="message" rows="5" placeholder="Write your message here..."&gt;&lt;/textarea&gt;</div>
                    <p><em>Remember: <code>&lt;textarea&gt;</code> needs a closing tag <code>&lt;/textarea&gt;</code> — it's NOT self-closing like <code>&lt;input&gt;</code>!</em></p>
                </div>
            </div>

            <div class="step">
                <div class="step-number">5</div>
                <div class="step-content">
                    <h4>Submit Button</h4>
                    <p>Find <code>&lt;!-- STEP 5 --&gt;</code> (below the last form-group) and add:</p>
                    <div class="code-inline">&lt;button type="submit"&gt;Send Message&lt;/button&gt;</div>
                    <p><em><code>type="submit"</code> tells the browser this button sends the form data. Without it, nothing happens on click!</em></p>
                </div>
            </div>
        </div>

        <div class="tip-box" style="margin-top:1.5rem;">
            <div class="note-header"><div class="note-icon tip-icon"><i class="fas fa-check-circle"></i></div><div class="note-title tip-title">When ready — click the green Submit button!</div></div>
            <p class="theory-text">The validator checks: ✓ text input for name &nbsp; ✓ email input &nbsp; ✓ select dropdown with options &nbsp; ✓ textarea for message &nbsp; ✓ submit button &nbsp; ✓ at least 4 labels</p>
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
            <div class="form-group"><!-- STEP 1: Name label + input --></div>
            <div class="form-group"><!-- STEP 2: Email label + input --></div>
            <div class="form-group"><!-- STEP 3: Subject label + select --></div>
            <div class="form-group"><!-- STEP 4: Message label + textarea --></div>
            <!-- STEP 5: Submit button -->
        </form>
    </div>
</body>
</html>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px 20px; }
.container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
h1 { color: #333; margin-bottom: 10px; font-size: 1.8rem; }
h1 + p { color: #666; margin-bottom: 30px; }
.form-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 8px; font-weight: 600; color: #444; }
input, select, textarea { width: 100%; padding: 12px 16px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1rem; transition: border-color 0.3s; }
input:focus, select:focus, textarea:focus { outline: none; border-color: #667eea; }
textarea { resize: vertical; min-height: 120px; }
button[type="submit"] { width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: 600; cursor: pointer; }`,
        js: `// No JavaScript needed`
    },
    hints: [
        "• Step 1: <label for=\"name\">Your Name:</label> then <input type=\"text\" id=\"name\" name=\"name\">",
        "• Step 2: Same pattern but type=\"email\"",
        "• Step 3: <select name=\"subject\"><option value=\"\">Pick one</option><option>General</option></select>",
        "• Step 4: <textarea id=\"message\" rows=\"5\" placeholder=\"...\"></textarea>",
        "• Step 5: <button type=\"submit\">Send Message</button>"
    ],
    validation: (code) => {
        const checks = [];
        checks.push({ passed: /<input[^>]+type=["']text["'][^>]*>/i.test(code.html), message: '✓ Added text input for name' });
        checks.push({ passed: /<input[^>]+type=["']email["'][^>]*>/i.test(code.html), message: '✓ Added email input' });
        checks.push({ passed: /<select[\s\S]*>[\s\S]*<option[\s\S]*>[\s\S]*<\/select>/i.test(code.html), message: '✓ Added select dropdown' });
        checks.push({ passed: /<textarea[\s\S]*><\/textarea>/i.test(code.html), message: '✓ Added textarea' });
        checks.push({ passed: /<button[^>]+type=["']submit["'][^>]*>/i.test(code.html), message: '✓ Added submit button' });
        checks.push({ passed: (code.html.match(/<label/gi) || []).length >= 4, message: '✓ Added labels for accessibility' });
        return checks;
    }
}

}; // end LESSONS

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
// STATE
// ============================================
let currentFile = 'html';
let editorContent = { html: '', css: '', js: '' };
let autoRefreshTimer = null;
let currentHintIndex = 0;

// ============================================
// UTILITIES
// ============================================
function showToast(message, type = 'info') {
    elements.toast.className = `toast toast-${type} show`;
    elements.toastMessage.textContent = message;
    setTimeout(() => elements.toast.classList.remove('show'), 4000);
}

function copyCode(button) {
    const code = button.closest('.code-block').querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const orig = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => button.innerHTML = orig, 2000);
    });
}

// ============================================
// PROGRESS
// ============================================
function updateProgress() {
    const pct = Math.round((CONFIG.progress.overall.completed / CONFIG.progress.overall.total) * 100);
    elements.progressFill.style.width = `${pct}%`;
    elements.progressValue.textContent = `${pct}%`;
    elements.htmlProgress.textContent = `${CONFIG.progress.html.completed}/${CONFIG.progress.html.total}`;
    elements.cssProgress.textContent = `${CONFIG.progress.css.completed}/${CONFIG.progress.css.total}`;
}

function markLessonCompleted(lessonId) {
    const item = document.querySelector(`[data-lesson="${lessonId}"]`);
    if (item && !item.classList.contains('completed')) {
        item.classList.add('completed');
        const icon = item.querySelector('.lesson-status i');
        if (icon) icon.className = 'fas fa-check-circle';
        if (lessonId.startsWith('html')) CONFIG.progress.html.completed++;
        else if (lessonId.startsWith('css')) CONFIG.progress.css.completed++;
        CONFIG.progress.overall.completed++;
        updateProgress();
        const user = localStorage.getItem('codecraft_current_user');
        if (user) saveProgress(user);
    }
}

// ============================================
// EDITOR
// ============================================
function updateLineNumbers() {
    const lines = elements.codeEditor.value.split('\n').length;
    const nums = Array.from({ length: Math.max(lines, 25) }, (_, i) => i + 1).join('<br>');
    elements.lineNumbers.innerHTML = nums;
    elements.lineNumbers.style.display = CONFIG.lineNumbers ? 'block' : 'none';
}

function saveCurrentFile() { editorContent[currentFile] = elements.codeEditor.value; }
function loadCurrentFile() { elements.codeEditor.value = editorContent[currentFile]; updateLineNumbers(); }

function updateFileTabs() {
    document.querySelectorAll('.file-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.file === currentFile);
    });
}

function runCode() {
    saveCurrentFile();
    const css = `<style>${editorContent.css}</style>`;
    const js  = `<script>${editorContent.js}<\/script>`;
    let html = editorContent.html;
    if (!html.includes('</head>')) {
        html = `<!DOCTYPE html><html><head>${css}</head><body>${html}${js}</body></html>`;
    } else {
        html = html.replace('</head>', `${css}</head>`).replace('</body>', `${js}</body>`);
    }
    const blob = new Blob([html], { type: 'text/html' });
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
    if (lesson?.hints?.length) {
        showToast(lesson.hints[currentHintIndex], 'info');
        currentHintIndex = (currentHintIndex + 1) % lesson.hints.length;
    }
}

function submitSolution() {
    saveCurrentFile();
    const lesson = LESSONS[CONFIG.currentLesson];
    if (!lesson?.validation) return;

    const results = lesson.validation(editorContent);
    const passed  = results.filter(r => r.passed).length;
    const score   = Math.round((passed / results.length) * 100);

    CONFIG.userScores[CONFIG.currentLesson] = score;
    elements.lessonScore.textContent = `${score}%`;

    if (score >= 75) {
        markLessonCompleted(CONFIG.currentLesson);
        elements.completionText.textContent = `Excellent! You scored ${score}% (${passed}/${results.length} checks passed)`;
        elements.completionOverlay.classList.add('active');
        showToast('<i class="fas fa-trophy"></i> Lesson completed! Great job!', 'success');
    } else {
        showToast(`Score: ${score}% — Keep trying! Use hints for help.`, 'error');
    }
}

// ============================================
// LESSON LOADING
// ============================================
// Браузер игнорирует <script> внутри innerHTML — переисполняем их вручную
function runEmbeddedScripts(container) {
    container.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr =>
            newScript.setAttribute(attr.name, attr.value)
        );
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

function loadLesson(lessonId) {
    const lesson = LESSONS[lessonId];
    if (!lesson) return;

    CONFIG.currentLesson = lessonId;
    currentHintIndex = 0;

    elements.lessonTitle.textContent    = lesson.title;
    elements.lessonSubtitle.textContent = lesson.subtitle;
    elements.theoryContent.innerHTML    = lesson.theory;
    runEmbeddedScripts(elements.theoryContent);

    editorContent = { ...lesson.initialCode };
    currentFile   = 'html';
    loadCurrentFile();
    updateFileTabs();

    elements.lessonItems.forEach(item => {
        item.classList.toggle('active', item.dataset.lesson === lessonId);
    });

    const score = CONFIG.userScores[lessonId];
    elements.lessonScore.textContent = score != null ? `${score}%` : '--';

    if (window.innerWidth <= 992) elements.sidebar.classList.add('collapsed');

    setTimeout(runCode, 100);

    const user = localStorage.getItem('codecraft_current_user');
    if (user) saveProgress(user);
}

function navigateToNextLesson() {
    const lessons = Array.from(elements.lessonItems);
    const idx = lessons.findIndex(i => i.dataset.lesson === CONFIG.currentLesson);
    if (idx < lessons.length - 1) loadLesson(lessons[idx + 1].dataset.lesson);
    elements.completionOverlay.classList.remove('active');
}

// ============================================
// EVENT LISTENERS
// ============================================
function initializeEventListeners() {
    elements.menuToggle?.addEventListener('click', () => elements.sidebar.classList.toggle('collapsed'));

    document.addEventListener('click', e => {
        if (window.innerWidth <= 992 &&
            !elements.sidebar.contains(e.target) &&
            !elements.menuToggle.contains(e.target) &&
            !elements.sidebar.classList.contains('collapsed')) {
            elements.sidebar.classList.add('collapsed');
        }
    });

    elements.lessonItems.forEach(item => item.addEventListener('click', () => loadLesson(item.dataset.lesson)));

    elements.fileTabs?.addEventListener('click', e => {
        const tab = e.target.closest('.file-tab');
        if (tab) { saveCurrentFile(); currentFile = tab.dataset.file; loadCurrentFile(); updateFileTabs(); }
    });

    elements.autoRefresh?.addEventListener('change', () => { CONFIG.autoRefresh = elements.autoRefresh.checked; });
    elements.lineNumbersToggle?.addEventListener('change', () => { CONFIG.lineNumbers = elements.lineNumbersToggle.checked; updateLineNumbers(); });

    elements.codeEditor?.addEventListener('input', () => {
        updateLineNumbers();
        if (CONFIG.autoRefresh) {
            clearTimeout(autoRefreshTimer);
            autoRefreshTimer = setTimeout(runCode, 800);
        }
    });

    elements.codeEditor?.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const s = elements.codeEditor.selectionStart;
            const end = elements.codeEditor.selectionEnd;
            elements.codeEditor.value = elements.codeEditor.value.substring(0, s) + '    ' + elements.codeEditor.value.substring(end);
            elements.codeEditor.selectionStart = elements.codeEditor.selectionEnd = s + 4;
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

    elements.theoryContent?.addEventListener('click', e => {
        if (e.target.closest('.copy-code')) copyCode(e.target.closest('.copy-code'));
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) elements.sidebar.classList.remove('collapsed');
    });
}

// ============================================
// INIT
// ============================================
function initializeAppWithLogin() {
    updateProgress();
    initializeEventListeners();
    updateLineNumbers();
    setTimeout(showLoginModal, 100);
    setInterval(() => {
        const user = localStorage.getItem('codecraft_current_user');
        if (user) saveProgress(user);
    }, 30000);
}

document.addEventListener('DOMContentLoaded', initializeAppWithLogin);