# RepoGraph AI - Demo Script

## IBM Bob Hackathon Presentation

---

## 2-Minute Demo Script

### Opening (15 seconds)

**[Show title slide or landing page]**

> "Legacy code costs enterprises millions. Developers spend weeks understanding old codebases, fear making changes, and accumulate technical debt. What if we could visualize dependencies and use AI to modernize code safely?"

**[Transition to application]**

> "Meet RepoGraph AI - a visual legacy modernization copilot powered by IBM Bob."

### Act 1: The Problem (20 seconds)

**[Load sample legacy repository]**

> "Here's a typical legacy Python codebase - 50 files, tangled dependencies, no documentation."

**[Click 'Scan Repository' button]**

> "RepoGraph AI parses the entire repository using AST analysis..."

**[Graph appears with nodes and edges]**

> "...and generates an interactive dependency graph. Each node is a file, class, or function. Edges show dependencies."

### Act 2: Visual Exploration (25 seconds)

**[Zoom and pan the graph]**

> "We can explore the codebase visually. Notice these red nodes? Those are hotspots - high risk code."

**[Click on a red/high-risk node]**

> "Let's click this complex function. The sidebar shows metadata: 120 lines, high complexity, 8 dependencies."

**[Highlight the 'Explain' button]**

> "Now here's where IBM Bob comes in. Let me ask Bob to explain this code."

**[Click 'Explain' - loading spinner appears]**

### Act 3: IBM Bob Intelligence (30 seconds)

**[IBM Bob explanation appears]**

> "IBM Bob analyzes the code in context - not just the snippet, but its role in the system. It tells us:
> - What this function does
> - Why it matters
> - Its complexity level
> - Dependency impact"

**[Scroll to show full explanation]**

> "But Bob doesn't stop there. Let's analyze technical debt."

**[Click 'Analyze' tab]**

> "IBM Bob identifies 3 critical issues:
> - High cyclomatic complexity
> - Missing error handling  
> - Security vulnerability with eval()"

**[Point to recommendations]**

> "And provides actionable recommendations."

### Act 4: The Magic - Modernization (40 seconds)

**[Click 'Modernize' button]**

> "Now for the magic. Let's ask IBM Bob to modernize this code."

**[Modernized code appears with diff view]**

> "In seconds, IBM Bob generates improved code with:
> - Type hints for better IDE support
> - Comprehensive docstrings
> - Improved error handling
> - Removed security vulnerabilities
> - Better structure"

**[Show diff highlighting]**

> "The diff view shows exactly what changed. Green for additions, red for removals."

**[Scroll to improvements list]**

> "Bob explains the improvements: reduced complexity, added safety, improved maintainability."

**[Click 'Generate Tests' tab]**

> "And it doesn't stop there - Bob generates comprehensive unit tests automatically."

**[Show generated test code]**

> "Complete with edge cases, error handling, and setup instructions."

### Act 5: Impact Analysis (20 seconds)

**[Return to graph view]**

> "But here's the critical part - before we make any changes, we need to understand the impact."

**[Click 'Show Dependencies' or highlight connected nodes]**

> "This function is called by 5 other components. RepoGraph AI visualizes the blast radius - we can see exactly what might break."

**[Point to dependency count]**

> "This is what makes RepoGraph AI different - it's not just AI code generation, it's dependency-aware modernization."

### Closing (10 seconds)

**[Return to dashboard or summary view]**

> "From weeks of manual analysis to minutes of AI-guided modernization. From fear-driven development to confident refactoring. That's RepoGraph AI - powered by IBM Bob."

**[Show final slide with key benefits]**

> "Thank you."

---

## 3-Minute Demo Script (Extended Version)

### Opening (20 seconds)

**[Show title slide]**

> "Imagine you're a developer joining a team with a 10-year-old codebase. 500 files. No documentation. Tangled dependencies. Your manager says 'we need to modernize this, but don't break anything.' Where do you even start?"

**[Pause for effect]**

> "This is the reality for thousands of enterprise developers. Legacy code costs organizations millions in slow onboarding, production incidents, and accumulated technical debt."

**[Transition to application]**

> "RepoGraph AI solves this problem by combining visual dependency analysis with IBM Bob's AI intelligence."

### Act 1: Repository Scanning (25 seconds)

**[Show file upload or path input]**

> "Let's start with a real legacy Python repository. I'll load this sample codebase."

**[Click 'Scan Repository']**

> "RepoGraph AI uses Python's AST - Abstract Syntax Tree - to parse every file safely, without executing any code."

**[Show parsing progress or logs]**

> "It extracts files, classes, functions, methods, and tracks all import relationships."

**[Graph appears]**

> "And generates this interactive dependency graph. We have 45 nodes representing code entities, and 67 edges showing dependencies."

### Act 2: Visual Exploration (30 seconds)

**[Show dashboard summary]**

> "The dashboard gives us immediate insights:
> - 12 files
> - 8 classes  
> - 25 functions
> - 5 high-risk nodes
> - 3 circular dependencies"

**[Click on graph]**

> "The graph is fully interactive. I can zoom, pan, search, and filter."

**[Demonstrate zoom and pan]**

> "Color coding shows risk levels: green is safe, yellow is moderate, red is high risk."

**[Point to a red node]**

> "This red node is a hotspot - let's investigate."

**[Click the red node]**

### Act 3: Node Analysis (35 seconds)

**[Sidebar opens with node details]**

> "The sidebar shows everything about this function:
> - Location: billing.py, lines 45-120
> - Type: function
> - Risk score: 0.85 out of 1.0
> - Technical debt score: 0.72
> - Tags: complex, long_function, high_coupling"

**[Show code snippet]**

> "Here's a snippet of the code. 75 lines, deeply nested, lots of dependencies."

**[Click 'Explain']**

> "Now let's ask IBM Bob to explain what's happening here."

**[IBM Bob explanation loads]**

> "IBM Bob doesn't just analyze the code snippet - it understands the full context:
> - This function handles payment processing
> - It's called by 8 other components
> - It has moderate complexity but high coupling
> - It's critical to the billing workflow"

**[Scroll through explanation]**

> "Bob identifies the logic flow, key operations, and dependency impact."

### Act 4: Technical Debt Analysis (30 seconds)

**[Click 'Analyze' tab]**

> "Let's dig deeper into the technical debt."

**[Show analysis results]**

> "IBM Bob identifies specific issues:

> **Issue 1**: High cyclomatic complexity - 15 decision points make this hard to test and maintain.

> **Issue 2**: Missing error handling - no try-except blocks for external API calls.

> **Issue 3**: Security vulnerability - uses eval() for dynamic calculation, which is a code injection risk."

**[Show recommendations]**

> "And Bob provides concrete recommendations:
> - Break down into smaller functions
> - Add comprehensive error handling
> - Replace eval() with ast.literal_eval()
> - Add type hints for better IDE support"

**[Show estimated refactor time]**

> "Estimated refactor time: 2-4 hours. That's actionable planning."

### Act 5: Code Modernization (45 seconds)

**[Click 'Modernize' button]**

> "Now here's where it gets powerful. Let's ask IBM Bob to modernize this code."

**[Loading indicator]**

> "IBM Bob is analyzing the code, detecting patterns, and generating improvements..."

**[Modernized code appears]**

> "And here's the result. Let me walk through the improvements."

**[Show diff view side-by-side]**

> "On the left, the original code. On the right, IBM Bob's modernized version.

> **Improvement 1**: Added type hints - now IDEs can catch errors before runtime.

> **Improvement 2**: Comprehensive docstring - explains parameters, return values, and exceptions.

> **Improvement 3**: Replaced eval() with safe alternative - security vulnerability eliminated.

> **Improvement 4**: Better error handling - specific exception types with clear messages.

> **Improvement 5**: Extracted helper functions - reduced complexity from 15 to 6."

**[Show improvements list]**

> "Bob explains each improvement and why it matters."

**[Show diff statistics]**

> "Diff stats: 15 lines added, 8 removed, 23 changed. Net improvement in maintainability."

### Act 6: Test Generation (25 seconds)

**[Click 'Generate Tests' tab]**

> "But we can't refactor without tests. Let's ask Bob to generate them."

**[Test code appears]**

> "IBM Bob generates a complete test suite:
> - Basic functionality tests
> - Edge case tests - empty input, None values, extreme values
> - Error handling tests - invalid input, exception raising
> - Performance tests for large datasets"

**[Scroll through test code]**

> "5 test cases with proper setup, assertions, and documentation. Ready to run with pytest."

**[Show test requirements]**

> "Bob even tells us what mocking we'll need - HTTP requests, file I/O, time functions."

### Act 7: Impact Analysis (20 seconds)

**[Return to graph view]**

> "Before we implement these changes, we need to understand the impact."

**[Highlight connected nodes]**

> "This function is called by 8 components, shown here in yellow. If we change the signature, all of these need updates."

**[Show dependency panel]**

> "RepoGraph AI shows:
> - 8 incoming dependencies
> - 3 outgoing dependencies  
> - Risk level: medium
> - Testing required: extensive"

**[Point to migration notes]**

> "And Bob provides migration notes: review call sites, update tests, deploy in stages."

### Act 8: Export and Implementation (15 seconds)

**[Click 'Export Patch' button]**

> "When we're ready, we can export the changes as a patch file or copy the code directly."

**[Show export options]**

> "The patch includes:
> - Modernized code
> - Generated tests
> - Documentation
> - Migration notes"

**[Show confidence score]**

> "IBM Bob gives this modernization an 88% confidence score - high reliability."

### Closing (15 seconds)

**[Return to dashboard]**

> "Let's recap what we just did in 3 minutes:
> 1. Scanned a legacy repository
> 2. Visualized dependencies
> 3. Identified high-risk code
> 4. Got IBM Bob's explanation
> 5. Analyzed technical debt
> 6. Generated modernized code
> 7. Created comprehensive tests
> 8. Assessed impact
> 9. Exported implementation-ready changes"

**[Show final slide]**

> "What used to take weeks now takes minutes. What used to be risky is now guided and safe. That's the power of RepoGraph AI with IBM Bob."

**[Pause]**

> "Thank you. Questions?"

---

## Key Talking Points

### IBM Bob Integration
- "IBM Bob is not an add-on - it's the core intelligence layer"
- "Every insight is powered by IBM Bob's understanding"
- "Context-aware analysis - Bob sees the whole repository, not just snippets"
- "Five AI operations: explain, analyze, modernize, test, document"

### Business Value
- "Reduces onboarding time by 60%"
- "Prevents production incidents through dependency awareness"
- "Quantifies technical debt automatically"
- "Generates implementation-ready code, not just suggestions"

### Technical Excellence
- "AST-based parsing - safe, no code execution"
- "Provider abstraction - clean architecture"
- "Confidence scoring - transparent AI reliability"
- "Repository-aware intelligence - not isolated analysis"

### Differentiation
- "Visual exploration + AI intelligence"
- "Dependency-aware modernization"
- "Risk-scored prioritization"
- "End-to-end workflow from analysis to implementation"

---

## Wow Moments

1. **Graph Appears**: Instant visual understanding of complex codebase
2. **Hotspot Highlighting**: Red nodes immediately show problem areas
3. **IBM Bob Explanation**: AI explains complex code in plain English
4. **Modernized Code Generation**: Complete refactoring in seconds
5. **Test Suite Generation**: Comprehensive tests automatically created
6. **Dependency Visualization**: See exactly what breaks if you change something
7. **Confidence Scores**: Transparent AI reliability

---

## Fallback Strategies

### If Live Demo Fails

**Option 1: Pre-recorded Video**
- Have a 2-minute video ready
- Show the same flow
- Narrate live over the video

**Option 2: Screenshots with Narration**
- Prepare 10-12 key screenshots
- Walk through the flow
- Emphasize the same talking points

**Option 3: Code Walkthrough**
- Show the codebase structure
- Explain the architecture
- Demonstrate IBM Bob integration in code
- Show example API responses

### If Questions Arise

**Q: "How is this different from GitHub Copilot?"**
A: "Copilot generates code snippets. RepoGraph AI provides repository-level understanding, dependency analysis, and risk-aware modernization. It's about understanding and transforming entire systems, not just writing new code."

**Q: "Does this work with languages other than Python?"**
A: "The MVP focuses on Python with robust AST parsing. The architecture is extensible - we can add JavaScript, TypeScript, Java, and even COBOL parsers. The IBM Bob integration works with any language."

**Q: "How accurate is the modernization?"**
A: "IBM Bob provides confidence scores for transparency. For the demo, modernization confidence is 88%. We also show breaking changes and migration notes so developers can review before implementing."

**Q: "Can this scale to large codebases?"**
A: "The current MVP handles repositories up to 1000 files efficiently. For production, we'd add caching, async processing, and database persistence. The architecture is designed for scale."

**Q: "How do you ensure security?"**
A: "We use AST parsing - no code execution. All analysis is static. IBM Bob identifies security vulnerabilities like eval(), exec(), and SQL injection patterns. The system itself doesn't execute user code."

---

## Demo Environment Setup

### Before Demo

1. **Backend Running**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. **Frontend Running**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Sample Repository Ready**
   - Have sample legacy repo in known location
   - Pre-test the scanning process
   - Verify all features work

4. **Browser Setup**
   - Clear cache
   - Close unnecessary tabs
   - Zoom level at 100%
   - Full screen mode ready

5. **Backup Plan**
   - Pre-recorded video ready
   - Screenshots prepared
   - Code examples ready

### During Demo

1. **Speak Clearly**: Judges may be remote
2. **Show, Don't Tell**: Let the UI speak
3. **Emphasize IBM Bob**: Mention it frequently
4. **Highlight Business Value**: Connect features to ROI
5. **Stay on Time**: 2-3 minutes max

### After Demo

1. **Answer Questions Confidently**
2. **Provide GitHub Link**
3. **Offer to Show Code**
4. **Thank Judges**

---

## Success Metrics

### Demo is Successful If:

✅ Judges understand the problem being solved  
✅ IBM Bob's central role is clear  
✅ Business value is obvious  
✅ Technical innovation is appreciated  
✅ UI looks polished and professional  
✅ Demo completes in 2-3 minutes  
✅ Wow moments land effectively  
✅ Questions are answered confidently  

---

**Prepared for IBM Bob Hackathon**  
**Project**: RepoGraph AI  
**Demo Duration**: 2-3 minutes  
**Target Audience**: Technical judges and business stakeholders