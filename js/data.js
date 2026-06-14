/* ============================================================
   CASE DATA — everything pulled from the subject's CV
   ============================================================ */
const DOI = (d)=>`https://doi.org/${d}`;
const A = (u,t)=>`<a href="${u}" target="_blank" rel="noopener">${t||u}</a>`;

const DATA = {};

DATA.laptop = {
  k:"EXHIBIT A-1 · THE TERMINAL", t:"Laptop — still unlocked",
  h:`<h4>WHAT THE SCREEN SHOWS</h4>
  <p>Half-finished code. The subject shipped software for over a decade — as a freelance consultant
  he co-created requirement-specific web and mobile apps; as a professor he ran the
  <b>Full-Stack Development Lab (MERN)</b> at MIT-WPU and taught Python for Data Science.</p>
  <h4>SKILL TRACE</h4>
  <table>
    <tr><td>Full-Stack / IoT development</td><td>8+ yrs</td></tr>
    <tr><td>Technical writing</td><td>8+ yrs</td></tr>
    <tr><td>Image processing / MATLAB</td><td>3+ yrs</td></tr>
    <tr><td>Cloud computing · Web dev · J2EE · Android</td><td>2+ yrs each</td></tr>
    <tr><td>Big Data / Data Science</td><td>2+ yrs</td></tr>
    <tr><td>Blockchain</td><td>1+ yrs</td></tr>
  </table>
  <h4>RECENT RUNS FOUND IN HISTORY</h4>
  <ul>
    <li><b>ML on public health data</b> — Classifying Tooth Loss &amp; Risk Factors in U.S. Adults (BRFSS 2022), <i>Electronics</i> 2025. ${A("https://www.mdpi.com/2079-9292/14/17/3559","paper")}</li>
    <li><b>Deep learning</b> — ScrapeSense: real-time intelligent web categorization (ICDSA 2025).</li>
    <li><b>Computer vision</b> — ClassScan 3D face-alignment attendance (IEEE CSITSS 2023, ${A(DOI("10.1109/CSITSS60515.2023.10334242"),"doi")}); distributed-camera face tracking &amp; route prediction (IEEE AIC 2024, ${A(DOI("10.1109/AIC61668.2024.10730825"),"doi")}).</li>
    <li><b>Assistive tech</b> — eye-blink Morse tool for ALS patients (IEEE I2CT 2024, ${A(DOI("10.1109/I2CT61223.2024.10543380"),"doi")}); sign-language gloves; Leap-Motion CSLR (Best Paper, IEEE AIC 2024).</li>
  </ul>`
};

DATA.lifi = {
  k:"EXHIBIT A-2 · THE PROTOTYPE", t:"Li-Fi rig — LEDs still warm",
  h:`<h4>THE OBSESSION: LIGHT IS DATA</h4>
  <p>The subject's Ph.D. (Information Technology, <b>NIT Karnataka</b>, 2017–2023, advisor Dr. Geetha V):
  <i>"A Framework for Efficient Modulation Techniques for Visible Light Communication for IoT
  Applications under Indoor Environment."</i> The bench is covered in its descendants.</p>
  <h4>KEY SIGNALS RECOVERED</h4>
  <ul>
    <li><b>Nested-texture image-pattern optical camera communication</b> — <i>IEEE Access</i>, 2022. ${A("https://ieeexplore.ieee.org/document/9915602","paper")}</li>
    <li><b>Hybrid FSK + PWM modulation for Li-Fi</b> — <i>Computation</i>, 2022. ${A("https://www.mdpi.com/2079-3197/10/7/110","paper")}</li>
    <li><b>QCD-inspired 2D multicolor LED-matrix MIMO</b> — <i>Applied Sciences</i>, 2022. ${A("https://www.mdpi.com/2076-3417/12/20/10204","paper")}</li>
    <li><b>LiCamIoT</b> 8×8 LED-matrix-to-camera link (IEEE SILCON 2022, ${A(DOI("10.1109/SILCON55242.2022.10028869"),"doi")}) · <b>LiCamPos</b> indoor positioning by light (ICSCCC 2021, ${A(DOI("10.1109/ICSCCC51823.2021.9478134"),"doi")}).</li>
    <li><b>Low-cost Li-Fi testbed</b> (Springer SIST 379, ${A("https://link.springer.com/chapter/10.1007/978-981-99-8612-5_21","chapter")}) and image transmission over it (ICSCCC 2021, ${A(DOI("10.1109/ICSCCC51823.2021.9478124"),"doi")}).</li>
    <li><b>Remote, configurable Li-Fi experiments</b> on Raspberry Pi + Arduino — GECOST 2025 (IEEE).</li>
  </ul>
  <h4>WEAPONIZED AS PATENTS</h4>
  <p><span class="pill grant">GRANTED · ZA 2023/02929</span><span class="pill grant">GRANTED · IN 202424013857</span><br>
  "Li-Fi for Secured Access to Wi-Fi for Conduction of On-Campus Online Exams" — granted in South Africa (2023) and India (2024); method also published at ICDMAI 2024 (${A(DOI("10.1007/978-981-97-3242-5_29"),"doi")}).</p>`
};

DATA.bench = {
  k:"EXHIBIT A-3 · FIELD HARDWARE", t:"IoT bench — prototypes that left the lab",
  h:`<h4>DEVICES LOGGED INTO EVIDENCE</h4>
  <ul>
    <li><b>Railway track crack detector</b> — solar-powered, AI + chatbot alerts (I-SMAC 2019, ${A(DOI("10.1109/I-SMAC47947.2019.9032670"),"doi")}); hardened into design patent IN 464849-001 (filed 2025).</li>
    <li><b>Teleoperated robotic system</b> — Indian patent 202421097626 (published 2025).</li>
    <li><b>HydroIoT</b> — multi-level hydroponics with edge computing (IEEE CSITSS 2021, ${A(DOI("10.1109/CSITSS54238.2021.9683621"),"doi")}).</li>
    <li><b>Saur Sikka</b> — P2P solar-power trading for nano-grids (I-SMAC 2020, ${A(DOI("10.1109/I-SMAC49090.2020.9243560"),"doi")}); smart water microgrid (Springer AISC 906, ${A(DOI("10.1007/978-981-13-6001-5_34"),"doi")}).</li>
    <li><b>AgrOne</b> — agricultural drone with vision + cloud analytics (I2CT 2018, ${A(DOI("10.1109/I2CT42659.2018.9057995"),"doi")}) — Best Project, Aavishkar 2017. The subject is also a <b>certified drone pilot</b>.</li>
    <li><b>Advhan</b> — crowd-sourced road-health monitoring (ICIMIA 2017, ${A(DOI("10.1109/ICIMIA.2017.7975635"),"doi")}) — Best Project, Unisys Cloud 20/20, 2017.</li>
    <li><b>Jamura</b> — conversational smart-home assistant (IEEE TENCON 2019, ${A(DOI("10.1109/TENCON.2019.8929316"),"doi")}); smart irrigation (I-SMAC 2017, ${A(DOI("10.1109/I-SMAC.2017.8058279"),"doi")}); waste-collecting line-follower robot; Wi-Fi RSSI human-following robot.</li>
    <li><b>UNESCO-sponsored</b> DIY Rainwater Harvesting Advisor — co-investigator &amp; developer, KSCST grant ₹1,50,000 (2016).</li>
  </ul>`
};

DATA.notes = {
  k:"EXHIBIT A-4 · LECTURE NOTES", t:"Notebook — a teaching trail, 12 years long",
  h:`<h4>EMPLOYMENT TIMELINE (RECONSTRUCTED)</h4>
  <table>
    <tr><td><b>MIT World Peace University, Pune</b> — Assistant Professor (Level 11). Teaching <b>AR/VR</b>; runs the Full-Stack (MERN) lab.</td><td>01/2026 – present</td></tr>
    <tr><td><b>University of Central Florida, USA</b> — Post-Doctoral Researcher, Center for Decision Support Systems &amp; Informatics. <b>Healthcare IoT &amp; AI</b>.</td><td>01/2025 – 10/2025</td></tr>
    <tr><td><b>Symbiosis Institute of Technology, Pune</b> — Assistant Professor; exam &amp; research committees.</td><td>08/2024 – 12/2024</td></tr>
    <tr><td><b>MIT-WPU, Pune</b> — Assistant Professor: DAA, C, Cloud &amp; Blockchain for Data Analytics, AI &amp; Expert Systems, IoT Lab, competitive coding.</td><td>10/2022 – 07/2024</td></tr>
    <tr><td><b>NIT Karnataka</b> — Research Scholar (Ph.D.), VLC/Li-Fi.</td><td>07/2017 – 10/2022</td></tr>
    <tr><td><b>Nitte Meenakshi Institute of Technology, Bengaluru</b> — Assistant Professor; led UNESCO/JNCASR/NGO-funded projects.</td><td>02/2015 – 03/2022</td></tr>
    <tr><td><b>MPSE, Nanded</b> — Assistant Professor; Asst. Director R&amp;D.</td><td>07/2014 – 02/2015</td></tr>
  </table>
  <p>Totals: <b>6 yrs teaching</b> (3 pre-Ph.D. + 3 post-Ph.D.) · <b>6 yrs research</b> · <b>12 yrs overall</b>.</p>
  <h4>MARGINALIA</h4>
  <p>Languages: Marathi (L1) · Hindi (L2) · English (C1). Interests scribbled on the back cover:
  DIY projects, volunteering, percussion &amp; music editing, surfing, travelling, cooking, dance.</p>`
};

DATA.patents = {
  k:"EXHIBIT B-1 · THE WALL", t:"Six patents, pinned like trophies",
  h:`<h4>INTELLECTUAL PROPERTY REGISTER</h4>
  <ol>
    <li><span class="pill grant">GRANTED</span><b>Li-Fi for Secured Access to Wi-Fi for Conduction of On-Campus Online Exams</b> — South African patent (CIPC) 2023/02929, 31 May 2023.</li>
    <li><span class="pill grant">GRANTED</span><b>Li-Fi for Secured Access to Wi-Fi for Conduction of On-Campus Online Exams</b> — Indian patent 202424013857, 30 Aug 2024.</li>
    <li><span class="pill">PUBLISHED</span><b>Teleoperated Robotic System</b> — Indian patent 202421097626, 17 Jan 2025.</li>
    <li><span class="pill">PUBLISHED</span><b>AI-Powered Content Creation in Automated Marketing Strategies</b> — Indian patent 202441025040, 29 Mar 2024.</li>
    <li><span class="pill">PUBLISHED</span><b>Integrated Smart Water Management System for Sustainable Urban Development</b> — Indian patent 202441068913, 13 Sep 2024.</li>
    <li><span class="pill">FILED</span><b>Wireless Sensor-Based Railway Track Crack Detection Device</b> — Indian design/IPR 464849-001, 7 Jul 2025.</li>
  </ol>`
};

DATA.awards = {
  k:"EXHIBIT B-2 · COMMENDATIONS", t:"Framed wins — paper and project",
  h:`<h4>BEST PAPER AWARDS</h4>
  <ul>
    <li><b>AIR 2025</b>, Nazarbayev University, Kazakhstan (Springer) — <i>"IoTaaS: An Internet of Things as a Service Framework for Virtual Experimentation"</i> — IoT &amp; Virtual Experimentation track.</li>
    <li><b>IEEE AIC 2024</b>, India — <i>"Continuous Sign Language Recognition using Leap Motion Sensor"</i> — Robotics, IoT &amp; Control Systems track. ${A(DOI("10.1109/AIC61668.2024.10730854"),"doi")}</li>
    <li><b>AITA 2024</b>, IFHE University, India — <i>"Early Investigations Into Music-Induced Neural and Cardiovascular Responses"</i> — Data Analytics &amp; Computing track.</li>
  </ul>
  <h4>BEST PROJECT AWARDS</h4>
  <ul>
    <li><b>Unisys Cloud 20/20</b>, Bengaluru, 2017 — <i>Advhan</i>, crowd-sourced road-health monitoring.</li>
    <li><b>Aavishkar 2017</b>, REVA University — <i>AgrOne</i>, computer-vision crop-health drone.</li>
  </ul>
  <h4>FUNDED WORK</h4>
  <ul><li><b>UNESCO via KSCST</b> — co-investigator &amp; developer, DIY Rainwater Harvesting Advisor, ₹1,50,000 (2016).</li></ul>`
};

DATA.creds = {
  k:"EXHIBIT B-3 · CREDENTIALS", t:"Diplomas — the paper trail",
  h:`<h4>DEGREES ON THE WALL</h4>
  <table>
    <tr><td><b>Ph.D., Information Technology</b> — National Institute of Technology Karnataka. Thesis: efficient modulation for VLC/Li-Fi in indoor IoT.</td><td>2017 – 2023</td></tr>
    <tr><td><b>M.Tech., Computer Network Engineering</b> — VTU. Thesis: ECK (Encryption-Compression-Key) data-security framework for clouds.</td><td>2012 – 2014</td></tr>
    <tr><td><b>B.E., Computer Science &amp; Engineering</b> — University of Pune. Thesis: word-set hierarchical clustering for large datasets.</td><td>2007 – 2012</td></tr>
  </table>
  <h4>SELECTED CERTIFICATIONS (25+)</h4>
  <p><span class="pill">edX · Applied Local LLMs</span><span class="pill">Google · Industrial IoT on GCP</span>
  <span class="pill">Google · Intro to AR &amp; ARCore</span><span class="pill">Microsoft · Data Science</span>
  <span class="pill">Microsoft+LinkedIn · Copilot for Productivity</span><span class="pill">Wipro · Global Java Trainer</span>
  <span class="pill">CloudXLab · ML Specialization</span><span class="pill">CITI · Human Subjects Research</span>
  <span class="pill">CITI · GCP Clinical Research</span><span class="pill">DRPC · Certified Drone Pilot</span>
  <span class="pill">LinkedIn · Prompt Engineering for GenAI</span><span class="pill">WES · Verified Intl. Academic Qualifications</span></p>`
};

DATA.journals = {
  k:"EXHIBIT C-1 · THE ARCHIVE", t:"Journal articles — 7 volumes",
  h:`<h4>PEER-REVIEWED JOURNALS</h4>
  <ol>
    <li>Gurupur, Hooshmand, Prabhu, Trader, <b>Salvi</b> — <b>Incompleteness of Electronic Health Records: An Impending Process Problem Within Healthcare</b>. <i>Healthcare</i> 13, 2900 (2025). ${A("https://www.mdpi.com/2227-9032/13/22/2900","mdpi.com")}</li>
    <li><b>Salvi</b>, Vu, Gurupur, King — <b>Digital Convergence in Dental Informatics: AI, IoT, Digital Twins &amp; LLMs with Security, Privacy and Ethical Perspectives</b>. <i>Electronics</i> 14, 3278 (2025). ${A("https://www.mdpi.com/2079-9292/14/16/3278","mdpi.com")}</li>
    <li><b>Salvi</b>, Garg, Gurupur — <b>Stage-Wise IoT Solutions for Alzheimer's Disease: Detection, Monitoring &amp; Assistive Technologies</b>. <i>Sensors</i> 25, 5252 (2025). ${A("https://www.mdpi.com/1424-8220/25/17/5252","mdpi.com")}</li>
    <li><b>Salvi</b>, Vu, Gurupur, King — <b>Classifying Tooth Loss and Assessing Risk Factors in U.S. Adults: ML on BRFSS 2022</b>. <i>Electronics</i> 14, 3559 (2025). ${A("https://www.mdpi.com/2079-9292/14/17/3559","mdpi.com")}</li>
    <li><b>Salvi</b>, Geetha — <b>A Nested Texture Inspired Novel Image Pattern Based Optical Camera Communication</b>. <i>IEEE Access</i> 10, 109056-109067 (2022). ${A("https://ieeexplore.ieee.org/document/9915602","ieee.org")}</li>
    <li><b>Salvi</b>, Vasantha — <b>Optical Camera Communication Using Hybrid Frequency-Shift + Pulse-Width Modulation for Li-Fi</b>. <i>Computation</i> 10, 110 (2022). ${A("https://www.mdpi.com/2079-3197/10/7/110","mdpi.com")}</li>
    <li>Vasantha, <b>Salvi</b> — <b>Quantum-Chromodynamics-Inspired 2D Multicolor LED Matrix to Camera Communication for User-Centric MIMO</b>. <i>Applied Sciences</i> 12, 10204 (2022). ${A("https://www.mdpi.com/2076-3417/12/20/10204","mdpi.com")}</li>
  </ol>
  <p>Citations index: <b>Google Scholar h-index 11 · i10-index 13 · Scopus h-index 8</b>.</p>`
};

DATA.chapters = {
  k:"EXHIBIT C-2 · THE ARCHIVE", t:"Book chapters — 8 volumes",
  h:`<h4>BOOK CHAPTERS</h4>
  <ol>
    <li><b>Comparative Analysis of Traditional vs. Blockchain-Enhanced IoT Systems</b> — in <i>Green Cyber-Physical Systems</i>, River Publishers, 2025 (accepted, in press).</li>
    <li><b>Design, Implementation &amp; Evaluation of a Low-Cost Visible Light Communication Testbed</b> — Springer SIST 379, 2023. ${A("https://link.springer.com/chapter/10.1007/978-981-99-8612-5_21","springer.com")}</li>
    <li><b>Directive-Based Programming Models on CPUs and GPUs for Scientific Applications</b> — Springer LNEE 790, 2022. ${A("https://link.springer.com/chapter/10.1007/978-981-16-1342-5_61","springer.com")}</li>
    <li><b>Fully Automated Waste Management System Using Line Follower Robot</b> — Springer LNEE 790, 2022. ${A("https://link.springer.com/chapter/10.1007/978-981-16-1342-5_18","springer.com")}</li>
    <li><b>Smart Biometric-Based Public Distribution System with Chatbot &amp; Cloud Support</b> — Springer LNDECT 55, 2021. ${A("https://link.springer.com/chapter/10.1007/978-981-15-8677-4_10","springer.com")}</li>
    <li><b>Smart Home Environment: AI-Enabled IoT Framework for Smart Living &amp; Smart Health</b> — IGI Global, 2021. ${A("https://www.igi-global.com/gateway/chapter/264787","igi-global.com")}</li>
    <li><b>Follow Me: A Human-Following Robot Using Wi-Fi RSSI</b> — Springer AISC 1270, 2021. ${A("https://link.springer.com/chapter/10.1007/978-981-15-8289-9_57","springer.com")}</li>
    <li><b>An IoT-Based Smart Water Microgrid &amp; Smart Water Tank Management System</b> — Springer AISC 906, 2019. ${A("https://link.springer.com/chapter/10.1007/978-981-13-6001-5_34","springer.com")}</li>
  </ol>`
};

DATA.confs = {
  k:"EXHIBIT C-3 · THE ARCHIVE", t:"Conference papers — 32 volumes",
  h:`<h4>2025</h4>
  <ol>
    <li><b>IoTaaS: IoT-as-a-Service Framework for Virtual Experimentation</b> — AIR 2025, Nazarbayev Univ., Kazakhstan (Springer). <span class="pill grant">BEST PAPER</span></li>
    <li><b>VLC for IoT-Enabled Healthcare: Applications, Challenges, Future Directions</b> — ICEC2NT 2025, Pune (IEEE).</li>
    <li><b>Towards Rechargeable &amp; Sustainable Metal-Air Batteries</b> — ICEC2NT 2025, Pune (IEEE).</li>
    <li><b>ScrapeSense: Deep-Learning Real-Time Web Categorization</b> — ICDSA 2025, MNIT Jaipur (Springer).</li>
    <li><b>Digital Replicas in Mental Healthcare Education</b> — GECOST 2025, Curtin Univ. Malaysia (IEEE).</li>
    <li><b>Raspberry Pi + Arduino Remote IoT Platform for Configurable Li-Fi Experiments</b> — GECOST 2025 (IEEE).</li>
  </ol>
  <h4>2024</h4>
  <ol start="7">
    <li><b>Crowd Density Estimation &amp; Monitoring using Digital Twins in Transport Hubs</b> — IEEE PuneCon. ${A(DOI("10.1109/PuneCon63413.2024.10895624"),"doi")}</li>
    <li><b>AR Sudoku Solver with Cognitive-Training Module</b> — IEEE AIC. ${A(DOI("10.1109/AIC61668.2024.10730905"),"doi")}</li>
    <li><b>Continuous Sign-Language Recognition with Leap Motion</b> — IEEE AIC. <span class="pill grant">BEST PAPER</span> ${A(DOI("10.1109/AIC61668.2024.10730854"),"doi")}</li>
    <li><b>Dynamic Face Tracking &amp; Route Prediction across Camera Networks</b> — IEEE AIC. ${A(DOI("10.1109/AIC61668.2024.10730825"),"doi")}</li>
    <li><b>Eye-Blink Morse-Code Tool for ALS Patients</b> — IEEE I2CT. ${A(DOI("10.1109/I2CT61223.2024.10543380"),"doi")}</li>
    <li><b>IoT-Blockchain Sharding via Frequent-Transactor Information</b> — IEEE I2CT. ${A(DOI("10.1109/I2CT61223.2024.10543556"),"doi")}</li>
    <li><b>Single-Person Occupancy Detection with PIR Sensors</b> — ICDMAI (Springer). ${A(DOI("10.1007/978-981-97-3242-5_37"),"doi")}</li>
    <li><b>Li-Fi-Secured Wireless Access during Online Exams</b> — ICDMAI (Springer). ${A(DOI("10.1007/978-981-97-3242-5_29"),"doi")}</li>
  </ol>
  <h4>2019 – 2023</h4>
  <ol start="15">
    <li><b>ClassScan: 3D Dense-Face-Alignment Attendance</b> — IEEE CSITSS 2023. ${A(DOI("10.1109/CSITSS60515.2023.10334242"),"doi")}</li>
    <li><b>2D LED-Matrix / Aztec-Pattern OCC for Industrial IoT</b> — IEEE INDICON 2022. ${A(DOI("10.1109/INDICON56171.2022.10040141"),"doi")}</li>
    <li><b>LiCamIoT: 8×8 LED-Matrix-to-Camera for LiFi-IoT</b> — IEEE SILCON 2022. ${A(DOI("10.1109/SILCON55242.2022.10028869"),"doi")}</li>
    <li><b>HydroIoT: Edge-Computing Multi-Level Hydroponics</b> — IEEE CSITSS 2021. ${A(DOI("10.1109/CSITSS54238.2021.9683621"),"doi")}</li>
    <li><b>Image Transmission on a Low-Cost Li-Fi Testbed</b> — ICSCCC 2021. ${A(DOI("10.1109/ICSCCC51823.2021.9478124"),"doi")}</li>
    <li><b>LiCamPos: Indoor Positioning by Light-to-Camera</b> — ICSCCC 2021. ${A(DOI("10.1109/ICSCCC51823.2021.9478134"),"doi")}</li>
    <li><b>Shadow-Based Low-Cost Hand-Movement Recognition</b> — IEEE I2CT 2021. ${A(DOI("10.1109/I2CT51068.2021.9417970"),"doi")}</li>
    <li><b>ROOF-Computing Indoor Positioning for IoT</b> — I-SMAC 2020. ${A(DOI("10.1109/I-SMAC49090.2020.9243580"),"doi")}</li>
    <li><b>Saur Sikka: Solar-Power Trading for Nano-Grids</b> — I-SMAC 2020. ${A(DOI("10.1109/I-SMAC49090.2020.9243560"),"doi")}</li>
    <li><b>AI Solar-Powered Railway-Crack Detection + Chatbot</b> — I-SMAC 2019. ${A(DOI("10.1109/I-SMAC47947.2019.9032670"),"doi")}</li>
    <li><b>From Light to Li-Fi: Modulation, MIMO, Deployment &amp; Handover Challenges</b> — ICDSE 2019. ${A(DOI("10.1109/ICDSE47409.2019.8971475"),"doi")}</li>
    <li><b>Jamura: Conversational Smart-Home Assistant</b> — IEEE TENCON 2019. ${A(DOI("10.1109/TENCON.2019.8929316"),"doi")}</li>
  </ol>
  <h4>2015 – 2018</h4>
  <ol start="27">
    <li><b>AgrOne: Agricultural Drone with IoT + Cloud Analytics</b> — I2CT 2018. ${A(DOI("10.1109/I2CT42659.2018.9057995"),"doi")}</li>
    <li><b>Cloud Analysis &amp; Monitoring of Smart Multi-Level Irrigation</b> — I-SMAC 2017. ${A(DOI("10.1109/I-SMAC.2017.8058279"),"doi")}</li>
    <li><b>Talking Hands: Sign-Language-to-Speech Gloves</b> — ICIMIA 2017. ${A(DOI("10.1109/ICIMIA.2017.7975564"),"doi")}</li>
    <li><b>Crowd-Sourced Road Structural-Health Monitoring App</b> — ICIMIA 2017. ${A(DOI("10.1109/ICIMIA.2017.7975635"),"doi")}</li>
    <li><b>Enhanced Multi-Tenant Architecture for Edu-Cloud</b> — ACM ICCCT 2015. ${A(DOI("10.1145/2818567.2818577"),"doi")}</li>
    <li><b>ECK-Based Data-Security Framework for Cloud IaaS</b> — IEEE IACC 2015. ${A(DOI("10.1109/IADCC.2015.7154830"),"doi")}</li>
  </ol>`
};

DATA.server = {
  k:"EXHIBIT D · THE MACHINE", t:"PROJECT TRANSCENDENCE — still running",
  h:`<h4>WHAT IT WAS COMPUTING</h4>
  <p>The rack hums with the subject's converging research lines — the things he was
  <i>"passionate about"</i> in his own notes:</p>
  <p><span class="pill">AI / MACHINE LEARNING</span><span class="pill">DIGITAL TWINS</span>
  <span class="pill">AR / VR</span><span class="pill">HEALTHCARE IoT</span><span class="pill">LI-FI / VLC</span>
  <span class="pill">AUTONOMOUS EVs</span><span class="pill">VEHICLE PLATOONING</span>
  <span class="pill">P2P ENERGY TRADING</span><span class="pill">QUANTUM COMPUTING</span><span class="pill">BLOCKCHAIN</span></p>
  <h4>LAST PROCESSES IN THE LOG</h4>
  <ul>
    <li><b>Digital twins</b> — crowd monitoring in transport hubs (IEEE PuneCon 2024) and digital replicas for mental-healthcare education (GECOST 2025).</li>
    <li><b>AR/VR</b> — currently instructing the AR/VR course at MIT-WPU; AR Sudoku cognitive trainer (IEEE AIC 2024); Google ARCore certified.</li>
    <li><b>Healthcare AI</b> — UCF post-doc output: EHR incompleteness, dental informatics, Alzheimer's IoT, tooth-loss ML (4 journal papers, 2025).</li>
  </ul>
  <h4>OUTPUT COUNTERS</h4>
  <table>
    <tr><td>Journal articles</td><td>7</td></tr>
    <tr><td>Conference papers</td><td>32</td></tr>
    <tr><td>Book chapters</td><td>8</td></tr>
    <tr><td>Patents</td><td>6</td></tr>
    <tr><td>Google Scholar h-index / i10</td><td>11 / 13</td></tr>
  </table>
  <p style="color:var(--warn)">⚠ The fans are accelerating. Keep scrolling — but whatever is in there, it knows you're here.</p>`
};

DATA.vr = {
  k:"EXHIBIT A-5 · HEAD-MOUNTED DISPLAY", t:"VR headset — left mid-session",
  h:`<h4>WHY IT'S ON THE DESK</h4>
  <p>The subject's current post: Assistant Professor at MIT-WPU, <b>instructing the AR/VR course</b>
  (01/2026 – present). The headset was a teaching instrument — and a research one.</p>
  <h4>TRACES IN THE LOG</h4>
  <ul>
    <li><b>AR Sudoku Solver with cognitive-training module</b> — IEEE AIC 2024. ${A(DOI("10.1109/AIC61668.2024.10730905"),"doi")}</li>
    <li><b>Digital Replicas in Mental Healthcare Education</b> — immersive digital twins for training, GECOST 2025 (IEEE).</li>
    <li><b>Crowd monitoring through digital twins</b> of transportation hubs — IEEE PuneCon 2024. ${A(DOI("10.1109/PuneCon63413.2024.10895624"),"doi")}</li>
    <li>Certified: <b>Google — Introduction to Augmented Reality and ARCore</b>.</li>
  </ul>
  <p>Note the irony in the case file: a man who taught virtual worlds appears to have moved into one.</p>`
};

DATA.printer3d = {
  k:"EXHIBIT F-1 · FABRICATION", t:"3D printer — job paused at 73%",
  h:`<h4>STILL WARM</h4>
  <p>The bed holds a half-printed translucent housing. Every device in this room passed through
  this corner first — the subject's bio lists <b>IoT hardware prototyping &amp; testing</b> as a core
  discipline across 12 years.</p>
  <h4>WHAT IT PRINTED</h4>
  <ul>
    <li>Enclosures for the <b>railway crack-detection device</b> — now Indian design/IPR 464849-001 (filed 2025).</li>
    <li>Mounts for the <b>Li-Fi testbeds</b> — the low-cost VLC testbed published with Springer (SIST 379) and its remote successor (GECOST 2025).</li>
    <li>Chassis parts for <b>HydroIoT</b> hydroponics tiers and the <b>smart water</b> rigs — work that became Indian patent 202441068913 (Integrated Smart Water Management, published 2024).</li>
    <li>Brackets and frames for student builds — the subject led project labs at NMIT &amp; MIT-WPU and DIY workshops (a listed interest: <b>DIY projects / volunteering</b>; UNESCO-funded DIY Rainwater Harvesting Advisor, 2016).</li>
  </ul>`
};

DATA.humanoid = {
  k:"EXHIBIT F-2 · EMBODIED AI", t:"Miniature humanoid — chest light still pulsing",
  h:`<h4>THE LITTLE WITNESS</h4>
  <p>A desktop humanoid unit, eyes blinking on a watch cycle. The subject kept returning to
  <b>robots that live among people</b>:</p>
  <ul>
    <li><b>Follow Me</b> — a human-following robot using Wi-Fi RSSI. Springer AISC 1270, 2021. ${A("https://link.springer.com/chapter/10.1007/978-981-15-8289-9_57","springer.com")}</li>
    <li><b>Fully automated waste-management line-follower robot</b> — Springer LNEE 790, 2022. ${A("https://link.springer.com/chapter/10.1007/978-981-16-1342-5_18","springer.com")}</li>
    <li><b>Jamura</b> — a conversational smart-home assistant (the social half of robotics) — IEEE TENCON 2019. ${A(DOI("10.1109/TENCON.2019.8929316"),"doi")}</li>
    <li><b>Continuous sign-language recognition</b> with Leap Motion — machines reading human hands. Best Paper, IEEE AIC 2024. ${A(DOI("10.1109/AIC61668.2024.10730854"),"doi")}</li>
  </ul>
  <p>Its chest LED pulses in the same rhythm as the server. Coincidence is not a word used in this office.</p>`
};

DATA.arm = {
  k:"EXHIBIT F-3 · TELEOPERATION", t:"Robotic arm — sweeping an empty bench",
  h:`<h4>WHO IS DRIVING IT?</h4>
  <p>The arm executes a slow scanning pattern, as if operated from <i>somewhere else</i>. Which was
  precisely the subject's research:</p>
  <ul>
    <li><span class="pill">PUBLISHED</span><b>Teleoperated Robotic System</b> — Indian patent 202421097626, 17 Jan 2025. Remote operation of robotic manipulators over networks.</li>
    <li><b>IoTaaS</b> — Internet of Things <i>as a Service</i>: remotely driving real lab hardware for virtual experimentation. <b>Best Paper</b>, AIR 2025, Nazarbayev University (Springer).</li>
    <li><b>Eye-blink Morse tool for ALS patients</b> — humans driving machines through the thinnest possible channel. IEEE I2CT 2024. ${A(DOI("10.1109/I2CT61223.2024.10543380"),"doi")}</li>
  </ul>
  <p>Conclusion in the margin of the case file: <i>"the operator does not need to be in the room."</i></p>`
};

DATA.testbed = {
  k:"EXHIBIT F-4 · REMOTE LABORATORY", t:"IoT testbed — NODE-3, still serving requests",
  h:`<h4>A LABORATORY THAT ANSWERS THE INTERNET</h4>
  <p>A three-tier rack of single-board computers, antennas live, matrix panel cycling.
  This is the physical half of the subject's flagship idea — <b>experiments you can rent</b>:</p>
  <ul>
    <li><b>IoTaaS: An Internet of Things as a Service Framework for Virtual Experimentation</b> —
      <span class="pill grant">BEST PAPER</span> AIR 2025, Nazarbayev University, Kazakhstan (Springer).</li>
    <li><b>A Raspberry Pi and Arduino-Powered Remote IoT Platform for Configurable Li-Fi Experiments</b> — GECOST 2025 (IEEE): students anywhere reconfigure this very class of rig.</li>
    <li><b>HydroIoT</b> multi-level hydroponics (IEEE CSITSS 2021, ${A(DOI("10.1109/CSITSS54238.2021.9683621"),"doi")}) and a <b>ROOF-computing indoor positioning system</b> (I-SMAC 2020, ${A(DOI("10.1109/I-SMAC49090.2020.9243580"),"doi")}) — earlier nodes of the same philosophy.</li>
    <li>Cloud lineage: <b>multi-tenant Edu-Cloud architecture</b> (ACM ICCCT 2015, ${A(DOI("10.1145/2818567.2818577"),"doi")}) and the <b>ECK cloud-security framework</b> from his M.Tech thesis (IEEE IACC 2015, ${A(DOI("10.1109/IADCC.2015.7154830"),"doi")}).</li>
  </ul>
  <p>NODE-3's last logged request came from inside the building. Then from nowhere at all.</p>`
};

DATA.scanner = {
  k:"EXHIBIT E-1 · PERCEPTION", t:"Laser scanner — sweeping the room on a loop",
  h:`<h4>STILL MAPPING. STILL LOOKING.</h4>
  <p>A tripod scanner turns beside the window, fan of green light brushing the walls — a sticky
  note on its column reads <i>"calib AGAIN."</i> Machines that perceive people were a constant thread:</p>
  <ul>
    <li><b>ClassScan</b> — classroom attendance via 3D dense face alignment + recognition. IEEE CSITSS 2023. ${A(DOI("10.1109/CSITSS60515.2023.10334242"),"doi")}</li>
    <li><b>Dynamic face tracking &amp; route prediction</b> across distributed camera networks. IEEE AIC 2024. ${A(DOI("10.1109/AIC61668.2024.10730825"),"doi")}</li>
    <li><b>Single-person occupancy detection</b> with PIR sensors. ICDMAI 2024 (Springer). ${A(DOI("10.1007/978-981-97-3242-5_37"),"doi")}</li>
    <li><b>Crowd-density estimation</b> with digital twins of transport hubs. IEEE PuneCon 2024. ${A(DOI("10.1109/PuneCon63413.2024.10895624"),"doi")}</li>
    <li><b>Shadow-based hand-movement recognition</b> — perception on a shoestring. IEEE I2CT 2021. ${A(DOI("10.1109/I2CT51068.2021.9417970"),"doi")}</li>
  </ul>
  <p>Investigators note: the scanner's point cloud of this room contains one silhouette too many.</p>`
};

DATA.drone = {
  k:"EXHIBIT F-5 · AIRBORNE", t:"Quadcopter — holding position, nobody on the sticks",
  h:`<h4>HOVERING OVER THE BENCH</h4>
  <p>Rotors at idle, nav strobes blinking. The subject is a <b>DRPC-certified drone pilot</b>,
  and the aircraft was never a toy:</p>
  <ul>
    <li><b>AgrOne</b> — an agricultural drone fusing computer vision, IoT telemetry, data analytics and cloud.
      I2CT 2018 (${A(DOI("10.1109/I2CT42659.2018.9057995"),"doi")}); ancestor "Agrone" won
      <b>Best Project, Aavishkar 2017</b> at REVA University for autonomous crop-health monitoring.</li>
    <li>Aerial sensing folds into his wider field-monitoring line: crowd-sourced <b>road-health monitoring</b>
      (<i>Advhan</i>, Best Project at Unisys Cloud 20/20, 2017; ICIMIA 2017, ${A(DOI("10.1109/ICIMIA.2017.7975635"),"doi")})
      and the solar <b>railway-crack detector</b> (I-SMAC 2019, ${A(DOI("10.1109/I-SMAC47947.2019.9032670"),"doi")}).</li>
    <li>Research passions on file: <b>autonomous electric vehicles &amp; vehicle platooning</b> — autonomy in the air was the rehearsal.</li>
  </ul>
  <p>Flight log's final waypoint: <i>this room</i>. No landing recorded.</p>`
};

DATA.hobbies = {
  k:"EXHIBIT G · AFTER HOURS", t:"Guitar, tabla, and three dance trophies",
  h:`<h4>THE MAN BEHIND THE MACHINES</h4>
  <p>Tucked between the gallery and the fabrication bay: an acoustic guitar on its stand,
  a tabla pair resting on a cushion — the syahi still carries fingertip wear — and a shelf
  of gold. The case file lists his off-duty signals plainly: <b>percussion &amp; music editing,
  dance, DIY projects, volunteering, cooking, surfing, travelling</b>.</p>
  <h4>THE TROPHY SHELF</h4>
  <ul>
    <li><b>SOLO</b> — the classic cup. One spotlight, one dancer.</li>
    <li><b>DUET</b> — two figures sharing a single base. Timing is everything.</li>
    <li><b>GROUP</b> — the tall one with the star. Choreography is just distributed systems with better music.</li>
  </ul>
  <h4>FIELD FOOTAGE</h4>
  <p>Investigators recovered his public feed — performances, builds, and everything in between:
  ${A("https://www.instagram.com/oneandonlysanket/","instagram.com/oneandonlysanket")}</p>
  <p>Marginal note in the file: <i>"a researcher who keeps rhythm debugs everything by ear."</i></p>`
};
