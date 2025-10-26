const REAGENTS = {
    DIL_HCL: { name: "حمض الهيدروكلوريك المخفف (dil HCl)", type: "group", target: "group1" },
    CONC_H2SO4: { name: "حمض الكبريتيك المركز (conc H₂SO₄)", type: "group", target: "group2" },
    BACL2: { name: "كلوريد الباريوم (BaCl₂)", type: "group", target: "group3" },
    MGSO4: { name: "كبريتات المغنيسيوم (MgSO₄)", type: "confirmatory" },
    PBA: { name: "خلات الرصاص (Pb(CH₃COO)₂)", type: "confirmatory" },
    AGNO3: { name: "نترات الفضة (AgNO₃)", type: "confirmatory" }
};

const SALTS = {
    "CO3--": {
        name: "كربونات", group: 1, ion: "CO₃²⁻",
        DIL_HCL: { obs: "فوران وغاز CO₂.", effect: "fizzing", nextAction: null }, 
        MGSO4: { obs: "راسب أبيض على البارد (White ppt on cold) ⚪", effect: "white-ppt" }
    },
    "HCO3-": {
        name: "بيكربونات", group: 1, ion: "HCO₃⁻",
        DIL_HCL: { obs: "فوران وغاز CO₂.", effect: "fizzing", nextAction: null },
        MGSO4: { obs: "لا يتكون راسب على البارد.", effect: "none", nextAction: "HEAT" }
    },
    "NO2-": {
        name: "نتريت", group: 1, ion: "NO₂⁻",
        DIL_HCL: { obs: "تصاعد أبخرة بنية على فوهة الأنبوبة.", effect: "brown-fumes", nextAction: null },
        AGNO3: { obs: "راسب أبيض (White ppt) ⚪", effect: "white-ppt" }
    },
    "SO3--": {
        name: "كبريتيت", group: 1, ion: "SO₃²⁻",
        DIL_HCL: { obs: "تصاعد غاز SO₂.", effect: "1", nextAction: "K2CR2O7" },
        PBA: { obs: "راسب أبيض (White ppt) ⚪", effect: "white-ppt" }
    },
    "Cl-": {
        name: "كلوريد", group: 2, ion: "Cl⁻",
        DIL_HCL: { obs: "سلبية (-ve)", effect: "none" },
        CONC_H2SO4: { obs: "تصاعد غاز HCl.", effect: "1", nextAction: "AMMONIA" },
        PBA: { obs: "راسب أبيض (White ppt) ⚪", effect: "white-ppt" },
        AGNO3: { obs: "راسب أبيض (White ppt) ⚪", effect: "white-ppt" }
    },
    "I-": {
        name: "يوديد", group: 2, ion: "I⁻",
        DIL_HCL: { obs: "سلبية (-ve)", effect: "none" },
        CONC_H2SO4: { obs: "تصاعد أبخرة بنفسجية داكنة (I₂) 🟣", effect: "violet-fumes", nextAction: null },
        PBA: { obs: "راسب أبيض (White ppt) ⚪", effect: "white-ppt" },
        AGNO3: { obs: "راسب أصفر 🟡", effect: "yellow-ppt" }
    },
    "SO4--": {
        name: "كبريتات", group: 3, ion: "SO₄²⁻",
        DIL_HCL: { obs: "سلبية (-ve)", effect: "none" },
        CONC_H2SO4: { obs: "سلبية (-ve)", effect: "none" },
        BACL2: { obs: "تكون راسب أبيض.", effect: "white-ppt", nextAction: "SOLUBILITY" },
        AGNO3: { obs: "راسب أبيض (White ppt) ⚪", effect: "white-ppt" }
    },
    "PO4---": {
        name: "فوسفات", group: 3, ion: "PO₄³⁻",
        DIL_HCL: { obs: "سلبية (-ve)", effect: "none" },
        CONC_H2SO4: { obs: "سلبية (-ve)", effect: "none" },
        BACL2: { obs: "تكون راسب أبيض.", effect: "white-ppt", nextAction: "SOLUBILITY" },
        AGNO3: { obs: "راسب أصفر 🟡", effect: "yellow-ppt" }
    }
};

const SALTS_ARRAY = Object.keys(SALTS);
let currentSaltKey = null;
let log = [];
let isPptPresent = false;
let isTestActive = false; // New state to enforce procedural flow

const elements = {
    status: document.getElementById('salt-status'),
    tube: document.getElementById('test-tube'),
    tubeContents: document.getElementById('salt-contents'),
    log: document.getElementById('observation-log'),
    guessSelect: document.getElementById('salt-guess'),
    guessBtn: document.getElementById('guess-btn'),
    guessResult: document.getElementById('guess-result'),
    reagentBtns: document.querySelectorAll('.reagent-btn'),
    resetTubeBtn: document.getElementById('reset-tube-btn'),
    actionBtns: {
        K2CR2O7: document.getElementById('action-k2cr2o7'),
        AMMONIA: document.getElementById('action-ammonia'),
        SOLUBILITY: document.getElementById('action-solubility'),
        HEAT: document.getElementById('action-heat')
    }
};

function disableAllActions() {
    Object.values(elements.actionBtns).forEach(btn => btn.disabled = true);
}

function disableAllReagents() {
    elements.reagentBtns.forEach(btn => btn.disabled = true);
}

function enableAllReagents() {
    elements.reagentBtns.forEach(btn => btn.disabled = false);
}

function clearVisuals() {
    elements.tubeContents.className = 'bg-gray-200';
    elements.tubeContents.innerHTML = '';
    elements.tube.classList.remove('fumes-active', 'cloud-active');
    isPptPresent = false;
}

function startNewGame() {
    currentSaltKey = SALTS_ARRAY[Math.floor(Math.random() * SALTS_ARRAY.length)];
    log.length = 0; 
    isTestActive = false;
    
    clearVisuals();
    disableAllActions();
    enableAllReagents();

    elements.status.innerHTML = 'ملح صلب مجهول جاهز للاختبار.';
    elements.log.innerHTML = '<p class="text-gray-400 text-center">لا توجد ملاحظات بعد.</p>';
    elements.guessBtn.disabled = false;
    elements.guessResult.classList.add('hidden');
    
    elements.guessSelect.innerHTML = '<option value="">-- اختر تخمينك --</option>';
    const shuffledSalts = [...SALTS_ARRAY].sort(() => Math.random() - 0.5);
    shuffledSalts.forEach(key => {
        const option = document.createElement('option');
        option.value = key; // Use the salt key (e.g., "CO3--") as the value
        option.textContent = SALTS[key].name + ' (' + SALTS[key].ion + ')';
        elements.guessSelect.appendChild(option);
    });
}

// Function to reset only the tube visuals and actions (keeping the salt and log)
function resetTube() {
    clearVisuals();
    disableAllActions();
    enableAllReagents();
    isTestActive = false;
    elements.status.innerHTML = 'الأنبوبة نظيفة. استمر في إضافة الكواشف.';
}

function getReaction(saltKey, reagentKey) {
    const salt = SALTS[saltKey];
    let reaction = salt[reagentKey];

    if (reaction) return reaction;

    // Default negative result logic
    const saltGroup = salt.group;
    let obsText = "سلبية (-ve)";

    if (reagentKey === 'DIL_HCL' && saltGroup > 1) {
        obsText = "سلبية (-ve). لا ينتمي للمجموعة الأولى.";
    } else if (reagentKey === 'CONC_H2SO4' && saltGroup > 2) {
        obsText = "سلبية (-ve). لا ينتمي للمجموعة الثانية.";
    } else if (reagentKey === 'BACL2' && saltGroup < 3) {
        obsText = "لا يوجد تفاعل مميز.";
    } else if (REAGENTS[reagentKey].type === 'confirmatory') {
        obsText = "لا يوجد تفاعل مميز أو نتيجة سلبية (-ve)";
    }
    
    return { obs: obsText, effect: "none" };
}

function applyVisualEffect(effect) {
    elements.tubeContents.classList.remove('fizzing', 'brown-fumes', 'violet-fumes', 'green-ppt', 'orange-ppt');
    elements.tubeContents.classList.add('bg-gray-200');

    if (effect === 'none') {
        return;
    }
    
    elements.tubeContents.classList.add(effect);

    // Gases/Fumes
    if (effect.includes('fumes')) {
         elements.tubeContents.style.height = '100%';
    }
    
    // Solution color change
    if (effect.includes('solution')) {
         elements.tubeContents.style.height = '100%';
    }

    // Precipitates
    if (effect.includes('ppt')) {
        if (!isPptPresent) {
            const pptLayer = document.createElement('div');
            pptLayer.className = `ppt ${effect}`;
            elements.tubeContents.appendChild(pptLayer);
            isPptPresent = true;
        }
    }
}

function logObservation(reagentName, observationText, logType) {
    const logItem = document.createElement('div');
    logItem.className = `log-item ${logType}`;
    logItem.innerHTML = `<b>${reagentName}:</b> ${observationText}`;
    
    if (log.length === 0) {
        elements.log.innerHTML = '';
    }
    elements.log.prepend(logItem); 
    log.push({ reagent: reagentName, result: observationText });
    elements.log.scrollTop = 0;
}

// --- Core Reagent Click Handler ---
elements.reagentBtns.forEach(btn => {
    btn.addEventListener('click', (event) => {
        if (isTestActive) return; // Prevent new test without reset
        
        const reagentKey = event.target.dataset.reagentKey;
        const reagentName = REAGENTS[reagentKey].name;
        const reaction = getReaction(currentSaltKey, reagentKey);
        
        // Set procedural state
        isTestActive = true; 
        disableAllReagents(); // Disable reagents after first test
        
        // Clear previous visuals and reset actions
        clearVisuals();
        disableAllActions();
        
        // Show visual effect
        applyVisualEffect(reaction.effect);

        // Determine log type and update status
        const isPositive = !reaction.obs.includes("سلبية (-ve)") && reaction.effect !== 'none';
        const logType = isPositive ? 'log-positive' : 'log-negative';
        elements.status.innerHTML = isPositive ? 'الملاحظة إيجابية. انظر إلى الأنبوب.' : 'الملاحظة سلبية. استمر في الاختبار أو خمن.';

        // Log observation (bypasses direct observation for complex tests like SO3-- and Cl-)
        let finalObs = reaction.obs;
        if (reaction.nextAction) {
            // For complex tests, log only the primary observation
             if (reagentKey === 'DIL_HCL' && currentSaltKey === 'SO3--') {
                finalObs = 'تصاعد غاز SO₂. يحتاج إلى كاشف إضافي للتأكيد.';
            } else if (reagentKey === 'CONC_H2SO4' && currentSaltKey === 'Cl-') {
                finalObs = 'تصاعد غاز HCl. يحتاج إلى تعريض للأمونيا للتأكيد.';
            }
        }
        logObservation(reagentName, finalObs, logType);
        
        // Enable next specific action if defined in SALTS data
        if (reaction.nextAction) {
            const nextActionBtn = elements.actionBtns[reaction.nextAction];
            if (nextActionBtn) nextActionBtn.disabled = false;
        }

        // Special handling for BaCl2 ppt to enable solubility test immediately
        if (reagentKey === 'BACL2' && (currentSaltKey === 'SO4--' || currentSaltKey === 'PO4---')) {
            elements.actionBtns.SOLUBILITY.disabled = false;
        }
        
        // Special handling for MgSO4 non-ppt to enable heat action (for HCO3-)
        if (reagentKey === 'MGSO4' && currentSaltKey === 'HCO3-') {
            elements.actionBtns.HEAT.disabled = false;
        }

        elements.guessBtn.disabled = false;
    });
});

// --- Action Buttons Handlers (K2Cr2O7, Ammonia, Solubility, Heat) ---

// K2Cr2O7 (Confirmatory for SO3--)
elements.actionBtns.K2CR2O7.addEventListener('click', () => {
    disableAllActions();
    const reagentName = "ثاني كرومات البوتاسيوم (K₂Cr₂O₇)";
    let obsText;

    if (currentSaltKey === 'SO3--') {
        // Visual sequence: Orange -> Green (slow transition)
        elements.tubeContents.classList.add('orange-ppt');
        elements.status.innerHTML = 'يتم إضافة كاشف ثاني كرومات البوتاسيوم...';
        
        setTimeout(() => {
            // Start slow transition
            elements.tubeContents.classList.remove('orange-ppt');
            elements.tubeContents.classList.add('green-ppt');
            obsText = "تغير لون المحلول من البرتقالي إلى <b>الأخضر</b>.";
            logObservation(reagentName, obsText, 'log-positive');
            elements.status.innerHTML = 'تم تسجيل الملاحظة التأكيدية.';
        }, 2000); // Wait 1 second before turning green (simulating reaction time)
    } else {
        obsText = "لا يوجد تغيير في اللون. نتيجة سلبية.";
        logObservation(reagentName, obsText, 'log-negative');
        elements.status.innerHTML = 'تم تسجيل الملاحظة التأكيدية.';
    }
});

// Ammonia (Confirmatory for Cl-)
elements.actionBtns.AMMONIA.addEventListener('click', () => {
    disableAllActions();
    const reagentName = "تعريض لساق الأمونيا";
    let obsText;

    if (currentSaltKey === 'Cl-') {
        // Insert cloud visual
        applyVisualEffect('ammonia-cloud');
obsText = "تكون <b>سحب بيضاء</b> كثيفة.";
        logObservation(reagentName, obsText, 'log-positive');
        // Remove cloud after logging (realism: cloud dissipates)
        setTimeout(() => {
            const cloud = document.getElementById('ammonia-cloud');
            if (cloud) cloud.remove();
        }, 1500);
    } else {
        obsText = "لا يوجد سحب بيضاء. نتيجة سلبية.";
        logObservation(reagentName, obsText, 'log-negative');
    }
    elements.status.innerHTML = 'تم تسجيل الملاحظة التأكيدية.';
});

// Heat (Confirmatory for HCO3-)
elements.actionBtns.HEAT.addEventListener('click', () => {
    disableAllActions();
    const reagentName = "تسخين/غلي المحلول";
    let obsText;

    if (currentSaltKey === 'HCO3-') {
        applyVisualEffect('white-ppt');
        obsText = "تكون <b>راسب أبيض</b> بعد التسخين.";
        logObservation(reagentName, obsText, 'log-positive');
    } else if (currentSaltKey === 'CO3--') {
        obsText = "راسب أبيض موجود بالفعل ولم يتغير.";
        logObservation(reagentName, obsText, 'log-negative');
    } else {
        obsText = "لا يوجد تغيير ملحوظ. نتيجة سلبية.";
        logObservation(reagentName, obsText, 'log-negative');
    }
    elements.status.innerHTML = 'تم تسجيل الملاحظة التأكيدية.';
});

// Solubility Test (SO4-- vs PO4---)
elements.actionBtns.SOLUBILITY.addEventListener('click', () => {
    elements.actionBtns.SOLUBILITY.disabled = true;
    const reagentName = "اختبار الذوبانية في dil HCl";
    const pptLayer = elements.tubeContents.querySelector('.ppt');
    let obsText;

    if (currentSaltKey === 'PO4---') {
        if (pptLayer) pptLayer.classList.add('dissolved');
        isPptPresent = false; // The ppt is gone
        obsText = "الراسب الأبيض <b>ذاب</b> في dil HCl.";
        logObservation(reagentName, obsText, 'log-positive');
    } else if (currentSaltKey === 'SO4--') {
        if (pptLayer) pptLayer.classList.remove('dissolved');
        obsText = "الراسب الأبيض <b>لم يذب</b> في dil HCl.";
        logObservation(reagentName, obsText, 'log-positive');
    } else {
        obsText = "لا يوجد راسب لتجربة الذوبانية. خطأ في التسلسل.";
        logObservation(reagentName, obsText, 'log-negative');
    }
    elements.status.innerHTML = 'تم تسجيل الملاحظة النهائية للراسب.';
});

function handleGuess() {
    const userGuessKey = elements.guessSelect.value;
    const correctSalt = SALTS[currentSaltKey];
    
    elements.guessResult.classList.remove('hidden');
    
    if (userGuessKey === currentSaltKey) { // FIX: Compare userGuessKey (e.g., "CO3--") to currentSaltKey (e.g., "CO3--")
        elements.guessResult.className = 'mt-3 p-3 text-center rounded-md font-bold bg-green-600 text-white';
        elements.guessResult.textContent = `🎉 تهانينا! الإجابة صحيحة. الملح هو ${correctSalt.name} (${correctSalt.ion}).`;
        elements.reagentBtns.forEach(btn => btn.disabled = true);
        disableAllActions();
        elements.guessBtn.disabled = true;
        elements.status.innerHTML = 'تم الكشف عن الملح بنجاح.';
    } else {
        elements.guessResult.className = 'mt-3 p-3 text-center rounded-md font-bold bg-red-600 text-white';
        elements.guessResult.textContent = `❌ تخمين خاطئ. الملح الصحيح كان: ${correctSalt.name} (${correctSalt.ion}).`; // Show the correct answer
        elements.reagentBtns.forEach(btn => btn.disabled = true);
        disableAllActions();
        elements.guessBtn.disabled = true;
        elements.status.innerHTML = 'انتهت اللعبة. أعد البدء للمحاولة مرة أخرى.';
    }
}

// Attach listeners
document.getElementById('reset-btn').addEventListener('click', startNewGame);
document.getElementById('reset-tube-btn').addEventListener('click', resetTube);
elements.guessBtn.addEventListener('click', handleGuess);

// Initialize the game
startNewGame();
