# Space Crawler

# Crawler Product Requirements Document (PRD)

---

This document outlines the requirements for developing web crawlers to collect  AI-related data for our website. The crawlers will scrape job listings, events, and products daily, sending results to a dashboard for admin review. *(Knowledge would be nice)*. Once approved by the admin, the content will be published on the website. you need to create (a) the crawlers (b) the admin  (c) the website

## 1. source for the jobs section

- [**https://livekit.io/careers**](https://livekit.io/careers)
- [**https://www.speechmatics.com/company/careers/roles**](https://www.speechmatics.com/company/careers/roles)
- [**https://deepgram.com/careers#careers-job-listing-section**](https://deepgram.com/careers#careers-job-listing-section)
- [**https://jobs.ashbyhq.com/livekit**](https://jobs.ashbyhq.com/livekit)
- [**https://job-boards.greenhouse.io/humeai**](https://job-boards.greenhouse.io/humeai)
- [**https://www.retellai.com/careers**](https://www.retellai.com/careers)
- [**https://job-boards.eu.greenhouse.io/speechmatics?gh_src=8f77c772teu**](https://job-boards.eu.greenhouse.io/speechmatics?gh_src=8f77c772teu)
- [**https://vivoka.com/career/**](https://vivoka.com/career/)
- [**https://www.linkedin.com/company/pyannoteai/jobs/**](https://www.linkedin.com/company/pyannoteai/jobs/)
- [**https://app.dover.com/Rime/careers/b80f11b5-dc4c-4f69-a73d-1573437839b3**](https://app.dover.com/Rime/careers/b80f11b5-dc4c-4f69-a73d-1573437839b3)
- https://inworld.ai/careers


## 2. events:
Visit the Lu.ma website (https://lu.ma) Use their search function to look for "voice AI" related events

## 3. Products:
- https://www.ycombinator.com/companies?query=voicehttps://topai.tools/category/voice
- https://www.producthunt.com/search?q=voice


## Admin Review Process

---

<aside>

### Revue Process

Once data is collected and processed, it will flow through this review process:

- **Dashboard presentation:** Admins access new data through the review dashboard
- **Content review:** Admins can approve, reject, or edit entries before publication
- **Publication:** Approved content is sent to the appropriate Supabase database via a "Send to Space" button
- **Website integration:** Approved content appears on [voiceaispace.com](http://voiceaispace.com) in the appropriate section.
</aside>


## Screenshots
1. product crawler : @Screenshots/product_crawler.png
2. jobs crawler : @Screenshots/events_crawler.png
3. events crawler : @Screenshots/events_crawler.png

## how to structure the content gathered from the crawlers :

## Product Description Generation

---


For AI products, the system will generate descriptions following this structure:

- 10-word factual description
- Company name and tagline as header
- Main description paragraph
- Key Features section with bullet points
- Use Cases section
- Getting Started section (URLs only)
- Closing summary paragraph

The description will be factual, objective, and based solely on information available on the company's website.

**Prompt :**

`Your role is to produce a 10 word objective and factual description, and a full description using the website url of a company I'll share.`

`CRITICAL FORMATTING RULES:`

`NEVER include any numbered citations like , , (1), (2) anywhere in the text`

`NEVER add reference numbers after sentences or paragraphs`

`Write all content as plain text without any citation markers`

`Do NOT cite sources within the body text - information should flow naturally`

`ONLY include clean, full URLs in the Getting Started section`

`Content Requirements:`

`Respect the exact same format shown in the example`

`Be factual and objective - do not invent information`

`Provide full descriptions of consistent length`

`Use the company website content only`

`Format Structure:`

`10-word factual description`

`Company name and tagline as header`

`Main description paragraph`

`Key Features section with bullet points`

`Use Cases section`

`Getting Started section (URLs only here)`

`Closing summary paragraph`

`Writing Style:`

`Write in clean, professional prose`

`No academic citations or reference markers`

`Information should read as original content`

`Focus on factual, objective descriptions`

`IMPORTANT: Write all content as clean, citation-free text. Do not add any numbers, brackets, or reference markers anywhere in the response except for bullet point formatting.`

RESULT:

AI interviewer automating high-volume recruiting process with 24/7 candidate assessment.

### **Full description**

---

Alpharun: AI Recruiting Agent for High-Volume Hiring Teams

Alpharun is an AI-powered recruiting platform that automates up to 90% of the hiring process for high-volume recruitment teams. The system provides 24/7 candidate interviewing with elite quality assessment, helping organizations cut time-to-hire in half while maintaining high standards and reducing recruiter workload.

Key Features

- 24/7 AI Interviewer: Conducts in-depth, conversational interviews assessing experience, language proficiency, retention risks, and 100+ job-specific skills.
- Automated Candidate Outreach: Instantly texts and emails applicants to move them through the hiring process.
- Senior-Level Interview Quality: Delivers interview quality comparable to experienced recruiters for better hiring decisions.
- Comprehensive Skill Assessment: Evaluates customer service ability, language proficiency, critical thinking, and numerous other skills in one cohesive interview.
- AI Grading System: Ranks candidates based on customizable criteria for confident decision-making.
- Video Monitoring: Ensures interview authenticity with advanced audio and video monitoring.
- ATS Integration: Connects seamlessly with existing job boards and applicant tracking systems.
- Time Efficiency: Reduces recruiter workload by automating repetitive screening calls and follow-ups.

Use Cases

- High-volume hiring teams needing to screen large candidate pools efficiently
- Organizations looking to reduce time-to-hire while maintaining quality standards
- Recruiting teams seeking to automate repetitive screening processes
- Companies wanting to improve candidate experience with 24/7 interview availability

Getting Started

- Website: [https://www.alpharun.com](https://www.alpharun.com/)

Alpharun transforms high-volume recruitment with an AI interviewer that cuts time-to-hire by 45% while achieving a 98% candidate satisfaction score. Teams can implement the system in just 5 minutes to start interviewing candidates faster and more efficiently than traditional methods.

### sending the content to the website:

The cards on the website display specific information for job and event, no need to modify the content, for the product we need to generate a demo and a supbage for full detail 

Screenshots/jobcard1.png + Screenshots/jobcard2.png
Screenshots/eventscard.png

## 2. Crawler Types

---
nb: i give you sources, but i must be able to add new sources if i want to


### 2.1 Jobs Crawler

This crawler will scan job boards, company websites, and recruitment platforms for Voice AI-related positions.

- **Data to collect:** Job title, company name, location (remote/onsite), description, requirements, salary range (if available), application link, publication date
- **Jobs sources**
    
    ### General Tech Job Boards
    
    - [LinkedIn Jobs](https://www.linkedin.com/jobs/) - Use filters and keywords like "voice AI," "speech recognition," "NLP"
    - [Indeed](https://www.indeed.com/) - Comprehensive job board with voice technology positions
    - [Glassdoor](https://www.glassdoor.com/) - Jobs plus company reviews and salary information
    - [AngelList](https://angel.co/jobs) - Startup-focused job board with many voice AI companies
    - [Y Combinator Jobs](https://www.ycombinator.com/jobs) - Jobs at YC-backed companies including voice tech
    
    ### Specialized AI/Voice Tech Job Boards
    
    - [Lever](https://jobs.lever.co/) - Many voice AI companies post openings here
    - [AI Job Boom](https://www.aijobboom.com/) - Dedicated to AI positions including voice technology
    - [AI-Jobs](https://ai-jobs.net/) - Specialized in artificial intelligence careers
    - [ML Trail](https://www.mltrail.com/) - Machine learning and AI positions
    - [Voice Tech Hub](https://www.voicetechhub.com/jobs) - Voice technology specific positions
    
    ### Company Career Pages
    
    - Voice AI Companies' Direct Career Pages:
    - [Deepgram Careers](https://deepgram.com/careers) - Speech recognition API
    - [Speechmatics Careers](https://www.speechmatics.com/company/careers) - Speech recognition technology
    - [AssemblyAI Careers](https://www.assemblyai.com/careers) - Speech-to-text API
    - [Nuance Careers](https://www.nuance.com/about-us/careers.html) - Speech recognition and AI solutions
    - 
    
    ### Remote-Focused Job Boards
    
    - [RemoteOK](https://remoteok.com/) - Remote jobs including voice technology positions
    - [We Work Remotely](https://weworkremotely.com/) - Remote job board with tech positions
    - [RemoteLeaf](https://remoteleaf.com/) - Curated remote job board
    
    ### Recruiting Platforms
    
    - [Hired](https://www.hired.com/) - Tech-focused recruiting platform
    - [Toptal](https://www.toptal.com/) - Freelance platform for top tech talent
    - [Upwork](https://www.upwork.com/) - Freelance marketplace with voice AI projects
    
    ### Industry-Specific Resources
    
    - [Voicebot.ai Jobs](https://voicebot.ai/jobs/) - Voice technology industry job board
    - [Voice First Jobs](https://voicefirstjobs.com/) - Voice tech specific positions
    - [Slator Job Board](https://slator.com/job-board/) - Language technology jobs including speech
    
    ### 
    
    - https://www.linkedin.com/jobs/search/?currentJobId=4244205637&f_C=3349412&geoId=92000000&origin=COMPANY_PAGE_JOBS_CLUSTER_EXPANSION&originToLandingJobPostings=4244205637%2C4223935698%2C4250477705%2C4250040874%2C3645900987%2C4246797919%2C4249876211%2C4250482295%2C4248362945
    - https://www.linkedin.com/jobs/search/?currentJobId=4239498507&f_C=18536189&geoId=92000000&origin=COMPANY_PAGE_JOBS_CLUSTER_EXPANSION&originToLandingJobPostings=4239498507%2C4237698108%2C4247381003%2C4242260088
    - https://www.linkedin.com/jobs/search/?currentJobId=4236698894&f_C=71539218&geoId=92000000&origin=COMPANY_PAGE_JOBS_CLUSTER_EXPANSION&originToLandingJobPostings=4236698894%2C4245162541%2C4248839673%2C4230819248
    
       
    

### **Sources:**

- [**https://livekit.io/careers**](https://livekit.io/careers)
- [**https://www.speechmatics.com/company/careers/roles**](https://www.speechmatics.com/company/careers/roles)
- [**https://deepgram.com/careers#careers-job-listing-section**](https://deepgram.com/careers#careers-job-listing-section)
- [**https://jobs.ashbyhq.com/livekit**](https://jobs.ashbyhq.com/livekit)
- [**https://job-boards.greenhouse.io/humeai**](https://job-boards.greenhouse.io/humeai)
- [**https://www.retellai.com/careers**](https://www.retellai.com/careers)
- [**https://job-boards.eu.greenhouse.io/speechmatics?gh_src=8f77c772teu**](https://job-boards.eu.greenhouse.io/speechmatics?gh_src=8f77c772teu)
- [**https://vivoka.com/career/**](https://vivoka.com/career/)
- [**https://www.linkedin.com/company/pyannoteai/jobs/**](https://www.linkedin.com/company/pyannoteai/jobs/)
- [**https://app.dover.com/Rime/careers/b80f11b5-dc4c-4f69-a73d-1573437839b3**](https://app.dover.com/Rime/careers/b80f11b5-dc4c-4f69-a73d-1573437839b3)

- **Filtering criteria:** Keywords related to voice AI, speech recognition, conversational AI, voice assistants, etc.
- **Processing:** Jobs will be preserved in their original format for admin review
</aside>

<aside>

### 2.2 Events Crawler

This crawler will identify upcoming Voice AI-related events, conferences, webinars, and meetups.

- [**Lu.ma](https://lu.ma) - Event hosting platform with many tech-focused events**
    
    ***To find Voice AI events on [Lu.ma](http://lu.ma/), you would need to:***
    
    ***Visit the [Lu.ma](http://lu.ma/) website ([https://lu.ma](https://lu.ma/))***
    
    ***Use their search function to look for "voice AI" related events***
    
    - **Events sources**
        - [Eventbrite](https://www.eventbrite.com) - Popular event platform with AI and voice technology events
        - [Meetup](https://www.meetup.com) - Community platform with voice AI meetups and workshops
        - [Conference Series](https://www.conferenceseries.com) - Hosts specialized AI and speech tech conferences
        - [AIEvents.ai](https://www.aievents.ai) - Dedicated platform for AI-specific events including voice AI
        - [SpeechTek](https://www.speechtek.com) - Voice technology industry conference listings
        - [Voice Summit](https://www.voicesummit.ai) - Voice tech industry event calendar
        - [AI Summit](https://www.aisummit.com) - Enterprise AI events including voice technology
        - [AI for Good](https://aiforgood.itu.int) - UN platform listing AI events including voice applications
        - [TalkingTech](https://www.talkingtech.ai) - Voice AI industry events and webinars
        - [Voicebot.ai Events](https://www.voicebot.ai/events) - Dedicated voice AI industry events calendar
        - [Devpost](https://www.devpost.com) - Hackathons with voice AI challenges and events
        - [Crowdcast](https://www.crowdcast.io) - Live video platform hosting voice AI webinars
        - [Hopin](https://www.hopin.com) - Virtual event platform with voice tech conference tracks
        - [TalkJS.ai](https://www.talkjs.ai) - Voice developer community events
- **Filtering criteria:** Keywords related to voice AI, speech tech, conversational interfaces, etc.
- **Processing:** Events will be preserved in their original format for admin review


### 2.3 Product Crawler

This crawler will identify new Voice AI products and tools, then generate standardized descriptions following a specific format.

- **Data to collect:** Product name, company, website URL, key features, use cases, pricing model
- **Target sources:** Product Hunt, company websites, tech blogs, app stores
    - https://www.ycombinator.com/companies?query=voicehttps://topai.tools/category/voice
    - https://www.producthunt.com/search?q=voice
    - **Product sources**
        - TBot sources
            - https://www.linkedin.com/search/results/all/?keywords=%23voiceai&origin=GLOBAL_SEARCH_HEADER&sid=PNDhttps://deepgram.com/ai-apps
            - https://theresanaiforthat.com/s/provide+me+with+a+list+of+50+voice+ai+startups/https://www.f6s.com/search?q=voice+aihttps://aiagentslist.com/?category=voice-ai-agents
        - Product Hunt Sources
            - [Product Hunt Voice Assistant Category](https://www.producthunt.com/topics/voice-assistant) - New voice assistant products
            - [Product Hunt Speech Recognition Category](https://www.producthunt.com/topics/speech-recognition) - Speech recognition products
            - [Product Hunt Text-to-Speech Category](https://www.producthunt.com/topics/text-to-speech) - TTS products
        - AI Product Directories
            - [Futurepedia Voice Assistant](https://www.futurepedia.io/ai-tools/voice-assistant) - Curated list of voice AI products
            - [TopAI.tools Voice Category](https://topai.tools/category/voice) - Popular voice AI tools
            - [AI Tools Club Voice Tag](https://www.aitoolsclub.com/tag/voice/) - Voice AI product listings
            - [AI Agents List](https://aiagentslist.com/?category=voice-ai-agents) - Voice AI agents directory
            - [That AI Collection](https://www.thataicollection.com/en/categories/speech) - Speech AI tools collection
        - Industry Resources
            - [Voicebot.ai](https://voicebot.ai/voice-assistant-industry-news/) - Voice assistant industry news featuring new products
            - [VentureBeat AI](https://venturebeat.com/category/ai/) - AI industry news including voice products
            - [Findstack Voice Recognition](https://findstack.com/voice-recognition-software/) - Voice recognition software directory
            - [G2 Speech Recognition Category](https://www.g2.com/categories/speech-recognition) - User-reviewed voice products
            - [Capterra Speech Recognition](https://www.capterra.com/speech-recognition-software/) - Business software directory
        - VC and Startup Platforms
            - [Crunchbase Voice Recognition Companies](https://www.crunchbase.com/hub/voice-recognition-companies) - Funded voice startups
            - [Y Combinator Voice Companies](https://www.ycombinator.com/companies?query=voice) - YC-backed voice startups
            - [AngelList Voice Technology](https://angel.co/voice-technology) - Voice tech startups and products
            - [F6S Voice AI](https://www.f6s.com/search?q=voice+ai) - Early-stage voice AI startups
        - Social Media and Community
- **Filtering criteria:** Keywords related to voice AI products, tools, platforms
- **Processing:** For each product, the system will generate a description using the provided prompt format



## 3. Technical Requirements

---


### 3.1 Crawler Architecture

- **Scheduling:** Automated daily runs with configurable timing




### 3.3 Dashboard Integration

- **Data delivery:** Send formatted results to the crawler dashboard  ( @Screenshots/product_crawler.png and @Screenshots/jobs_crawler.png and @Screenshots/events_crawler.png) that you need to create
- **Notification:** Alert admins when new data is available for review
