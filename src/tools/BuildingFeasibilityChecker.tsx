// Toolique Building Feasibility & Bye-Law Checker - Location-Aware Architectural Feasibility Engine

import { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Ruler, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Send, 
  Compass, 
  ChevronRight, 
  ChevronLeft, 
  RefreshCw, 
  BookOpen, 
  Flame, 
  Trees, 
  Sliders, 
  FileCheck, 
  Eye, 
  HelpCircle, 
  ExternalLink, 
  Search, 
  Layers, 
  MapPin, 
  Navigation, 
  CheckCircle, 
  X,
  Building,
  Landmark,
  ShieldAlert
} from 'lucide-react';
import type { 
  AreaUnit, 
  BuildingUse, 
  SiteLocationInput, 
  PlotInfoInput, 
  ProposedDevelopmentInput, 
  SiteConditionsInput,
  FeasibilityReport,
  ComplianceStatus,
  RuleCategory
} from '../data/byeLaws/types';
import { 
  JURISDICTION_INDEX, 
  resolveLocationFromCoordinates
} from '../data/byeLaws/jurisdictionIndex';
import type {
  JurisdictionState,
  JurisdictionCity,
  JurisdictionAuthority
} from '../data/byeLaws/jurisdictionIndex';
import { 
  OFFICIAL_BYE_LAWS_DATABASE, 
  ALL_REGULATION_DOCUMENTS, 
  GLOBAL_PLATFORM_STATS, 
  calculateJurisdictionCoverage,
  MAJOR_RULE_CATEGORIES
} from '../data/byeLaws/regulationsDatabase';
import { calculateBuildingFeasibility, normalizePlotArea } from '../data/byeLaws/calculationEngine';
import { answerReportQuestion, DEFAULT_SUGGESTED_PROMPTS } from '../data/byeLaws/aiAssistantEngine';
import type { AssistantMessage } from '../data/byeLaws/aiAssistantEngine';
import { generateFeasibilityPdf } from '../data/byeLaws/pdfReportGenerator';

export default function BuildingFeasibilityChecker() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<'wizard' | 'matrix' | 'ai' | 'database'>('wizard');
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'client' | 'technical'>('client');
  const [copied, setCopied] = useState<boolean>(false);

  // Database Tab Sub-Navigation
  const [databaseViewMode, setDatabaseViewMode] = useState<'my_location' | 'browse_all' | 'search'>('my_location');

  // Location Selector State (Cascading State -> City -> Authority)
  const [selectedStateId, setSelectedStateId] = useState<string>('rajasthan');
  const [selectedCityId, setSelectedCityId] = useState<string>('jaipur');
  const [selectedAuthorityId, setSelectedAuthorityId] = useState<string>('jda_jaipur');
  const [isNotSureAuthority, setIsNotSureAuthority] = useState<boolean>(false);
  const [showNotSureHelpModal, setShowNotSureHelpModal] = useState<boolean>(false);

  // Geolocation Detection State
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [detectedLocationText, setDetectedLocationText] = useState<string | null>(null);
  const [detectedCoords, setDetectedCoords] = useState<{ stateId: string; cityId: string; authorityId: string } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Form State: Step 1 - Site Location
  const [siteLocation, setSiteLocation] = useState<SiteLocationInput>({
    country: 'India',
    state: 'rajasthan',
    cityAuthority: 'jda_jaipur',
    zone: 'Residential Plotted',
    roadWidth: 12.0,
    pinCode: '302001',
    locality: 'Tonk Road, Jaipur'
  });

  // Form State: Step 2 - Plot Information
  const [plotInfo, setPlotInfo] = useState<PlotInfoInput>({
    plotArea: 250,
    areaUnit: 'sq_m',
    dimensionUnit: 'm',
    frontageWidth: 12.5,
    plotDepth: 20.0,
    isCornerPlot: false,
    isIrregularPlot: false,
    hasExistingStructure: false,
    northOrientation: 0
  });

  // Form State: Step 3 - Proposed Development
  const [proposal, setProposal] = useState<ProposedDevelopmentInput>({
    buildingUse: 'residential_plotted',
    projectType: 'new_construction',
    proposedFloors: 4,
    hasStilt: true,
    hasBasement: false,
    basementFloors: 1,
    proposedGroundCoverageSqM: 160,
    proposedTotalBuaSqM: 500,
    proposedHeightM: 15.0,
    dwellingUnits: 4,
    proposedParkingSpaces: 4
  });

  // Form State: Step 4 - Site Conditions
  const [conditions, setConditions] = useState<SiteConditionsInput>({
    nearAirport: false,
    airportDistanceKm: 15,
    nearHighway: false,
    highwayType: 'none',
    nearRailway: false,
    railwayDistanceM: 50,
    inHeritageZone: false,
    nearWaterBodyOrNallah: false,
    waterBodyDistanceM: 100,
    isEcoSensitiveOrForest: false
  });

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState<AssistantMessage[]>([]);
  const [userInputText, setUserInputText] = useState<string>('');

  // Bye-Laws Browser Filter State
  const [adminSearch, setAdminSearch] = useState<string>('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<RuleCategory | 'all'>('all');
  const [selectedJurisdictionFilter, setSelectedJurisdictionFilter] = useState<string>('all');

  // Load Saved Jurisdiction from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolique_jurisdiction_pref');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.stateId) setSelectedStateId(parsed.stateId);
        if (parsed.cityId) setSelectedCityId(parsed.cityId);
        if (parsed.authorityId) setSelectedAuthorityId(parsed.authorityId);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to LocalStorage when location changes
  useEffect(() => {
    try {
      localStorage.setItem('toolique_jurisdiction_pref', JSON.stringify({
        stateId: selectedStateId,
        cityId: selectedCityId,
        authorityId: selectedAuthorityId
      }));
    } catch {
      // ignore
    }
  }, [selectedStateId, selectedCityId, selectedAuthorityId]);

  // Derived Jurisdiction Objects
  const currentStateObj: JurisdictionState = useMemo(() => {
    return JURISDICTION_INDEX.find(s => s.id === selectedStateId) || JURISDICTION_INDEX[0];
  }, [selectedStateId]);

  const currentCityObj: JurisdictionCity = useMemo(() => {
    return currentStateObj.cities.find(c => c.id === selectedCityId) || currentStateObj.cities[0] || {
      id: 'default_city',
      name: 'City',
      authorities: [],
      commonLocalities: []
    };
  }, [currentStateObj, selectedCityId]);

  const currentAuthorityObj: JurisdictionAuthority | undefined = useMemo(() => {
    if (isNotSureAuthority) return undefined;
    return currentCityObj.authorities.find(a => a.id === selectedAuthorityId) || currentCityObj.authorities[0];
  }, [currentCityObj, selectedAuthorityId, isNotSureAuthority]);

  // Handle Cascading State Change
  const handleStateSelect = (stateId: string) => {
    setSelectedStateId(stateId);
    const st = JURISDICTION_INDEX.find(s => s.id === stateId) || JURISDICTION_INDEX[0];
    const firstCity = st.cities[0];
    setSelectedCityId(firstCity.id);
    const firstAuth = firstCity.authorities[0];
    setSelectedAuthorityId(firstAuth ? firstAuth.id : '');
    setIsNotSureAuthority(false);

    // Sync with wizard form state
    setSiteLocation(prev => ({
      ...prev,
      state: stateId,
      cityAuthority: firstAuth ? firstAuth.id : '',
      zone: firstAuth?.availableZones[0] || 'Residential',
      roadWidth: firstAuth?.defaultRoadWidthM || 12.0
    }));
  };

  // Handle Cascading City Change
  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(cityId);
    const ct = currentStateObj.cities.find(c => c.id === cityId);
    const firstAuth = ct?.authorities[0];
    setSelectedAuthorityId(firstAuth ? firstAuth.id : '');
    setIsNotSureAuthority(false);

    // Sync with wizard form state
    if (firstAuth) {
      setSiteLocation(prev => ({
        ...prev,
        cityAuthority: firstAuth.id,
        zone: firstAuth.availableZones[0] || 'Residential',
        roadWidth: firstAuth.defaultRoadWidthM || 12.0
      }));
    }
  };

  // Handle Authority Change
  const handleAuthoritySelect = (authId: string) => {
    if (authId === 'not_sure') {
      setIsNotSureAuthority(true);
      setSelectedAuthorityId('');
    } else {
      setIsNotSureAuthority(false);
      setSelectedAuthorityId(authId);
      const auth = currentCityObj.authorities.find(a => a.id === authId);
      if (auth) {
        setSiteLocation(prev => ({
          ...prev,
          cityAuthority: auth.id,
          zone: auth.availableZones[0] || 'Residential',
          roadWidth: auth.defaultRoadWidthM || 12.0
        }));
      }
    }
  };

  // Geolocation Handler ("📍 Use My Location")
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationError(null);
    setDetectedLocationText(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        const { latitude, longitude } = pos.coords;
        const matched = resolveLocationFromCoordinates(latitude, longitude);

        if (matched) {
          const st = JURISDICTION_INDEX.find(s => s.id === matched.stateId);
          const ct = st?.cities.find(c => c.id === matched.cityId);
          setDetectedCoords(matched);
          setDetectedLocationText(`${ct?.name || 'Detected City'}, ${st?.name || 'India'}`);
        } else {
          // Fallback: Default to closest regional hub
          setDetectedCoords({ stateId: 'rajasthan', cityId: 'jaipur', authorityId: 'jda_jaipur' });
          setDetectedLocationText('Jaipur, Rajasthan (Regional Default)');
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        setLocationError(err.message || 'Unable to retrieve your location. Please select manually.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // Confirm Detected Location
  const handleConfirmDetectedLocation = () => {
    if (detectedCoords) {
      handleStateSelect(detectedCoords.stateId);
      handleCitySelect(detectedCoords.cityId);
      if (detectedCoords.authorityId) {
        handleAuthoritySelect(detectedCoords.authorityId);
      }
    }
    setDetectedLocationText(null);
    setDetectedCoords(null);
  };

  // Real-time Feasibility Report Computation
  const report: FeasibilityReport = useMemo(() => {
    return calculateBuildingFeasibility(siteLocation, plotInfo, proposal, conditions);
  }, [siteLocation, plotInfo, proposal, conditions]);

  // Live Unit Conversion helper
  const normalizedArea = useMemo(() => {
    return normalizePlotArea(plotInfo.plotArea, plotInfo.areaUnit, siteLocation.state);
  }, [plotInfo.plotArea, plotInfo.areaUnit, siteLocation.state]);

  // Dimension Unit Helpers (Meters <-> Feet)
  const isDimInFt = plotInfo.dimensionUnit === 'ft';

  const handleDimensionUnitChange = (newUnit: 'm' | 'ft') => {
    if (plotInfo.dimensionUnit === newUnit) return;
    if (newUnit === 'ft') {
      const ftFrontage = Math.round((plotInfo.frontageWidth * 3.28084) * 10) / 10;
      const ftDepth = Math.round((plotInfo.plotDepth * 3.28084) * 10) / 10;
      setPlotInfo(prev => ({
        ...prev,
        dimensionUnit: 'ft',
        frontageWidth: ftFrontage,
        plotDepth: ftDepth
      }));
    } else {
      const mFrontage = Math.round((plotInfo.frontageWidth * 0.3048) * 10) / 10;
      const mDepth = Math.round((plotInfo.plotDepth * 0.3048) * 10) / 10;
      setPlotInfo(prev => ({
        ...prev,
        dimensionUnit: 'm',
        frontageWidth: mFrontage,
        plotDepth: mDepth
      }));
    }
  };

  // Real-time calculated area from frontage & depth
  const computedAreaFromDimensions = useMemo(() => {
    const w = plotInfo.frontageWidth || 0;
    const d = plotInfo.plotDepth || 0;
    if (w <= 0 || d <= 0) return null;
    if (isDimInFt) {
      const sqFt = Math.round(w * d * 100) / 100;
      const sqM = Math.round(sqFt * 0.09290304 * 100) / 100;
      return { sqFt, sqM, product: sqFt, unitLabel: 'ft²' };
    } else {
      const sqM = Math.round(w * d * 100) / 100;
      const sqFt = Math.round(sqM * 10.7639104 * 100) / 100;
      return { sqFt, sqM, product: sqM, unitLabel: 'm²' };
    }
  }, [plotInfo.frontageWidth, plotInfo.plotDepth, isDimInFt]);

  const handleApplyDimensionArea = () => {
    if (!computedAreaFromDimensions) return;
    if (plotInfo.areaUnit === 'sq_ft') {
      setPlotInfo(prev => ({ ...prev, plotArea: computedAreaFromDimensions.sqFt }));
    } else if (plotInfo.areaUnit === 'sq_m') {
      setPlotInfo(prev => ({ ...prev, plotArea: computedAreaFromDimensions.sqM }));
    } else if (plotInfo.areaUnit === 'sq_yd') {
      setPlotInfo(prev => ({ ...prev, plotArea: Math.round((computedAreaFromDimensions.sqFt / 9) * 100) / 100 }));
    } else {
      setPlotInfo(prev => ({
        ...prev,
        plotArea: isDimInFt ? computedAreaFromDimensions.sqFt : computedAreaFromDimensions.sqM,
        areaUnit: isDimInFt ? 'sq_ft' : 'sq_m'
      }));
    }
  };

  // Handle AI Question
  const handleSendAiQuestion = (qText: string) => {
    if (!qText.trim()) return;
    const userMsg: AssistantMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: qText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const botMsg = answerReportQuestion(report, qText);
    setChatMessages(prev => [...prev, userMsg, botMsg]);
    setUserInputText('');
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const text = `TOOLIQUE BUILDING FEASIBILITY SUMMARY
Location: ${report.resolvedJurisdiction.authorityName}, ${report.resolvedJurisdiction.stateName}
Primary Code: ${report.resolvedJurisdiction.primaryCode}
Plot Area: ${report.input.normalizedPlotAreaSqM.toFixed(1)} sq.m (${report.input.normalizedPlotAreaSqFt.toFixed(0)} sq.ft)
Proposed Use: ${report.input.proposal.buildingUse.replace(/_/g, ' ').toUpperCase()} (${report.input.proposal.proposedFloors} Floors)
Feasibility Status: ${report.executiveSummary.headline}
Base FAR: ${report.developmentControls.far.baseFar} | Max FAR: ${report.developmentControls.far.effectiveMaxFar}
Max Ground Coverage: ${report.developmentControls.groundCoverage.permittedMaxPct}% (${report.developmentControls.groundCoverage.permittedMaxSqM.toFixed(1)} sq.m)
Setbacks: Front ${report.developmentControls.setbacks.frontM}m, Rear ${report.developmentControls.setbacks.rearM}m, Sides ${report.developmentControls.setbacks.leftM}m
Parking: ${report.developmentControls.parking.requiredEcs} ECS
*Generated on Toolique.in - Preliminary Advisory Only*`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // -------------------------------------------------------------------------
  // LOCATION-BASED BYE-LAW FILTERING ENGINE
  // -------------------------------------------------------------------------
  // Real-Time Dynamic Jurisdiction Coverage Score
  const jurisdictionCoverage = useMemo(() => {
    return calculateJurisdictionCoverage(selectedStateId, selectedCityId, selectedAuthorityId, OFFICIAL_BYE_LAWS_DATABASE);
  }, [selectedStateId, selectedCityId, selectedAuthorityId]);

  const locationRegulationsStack = useMemo(() => {
    const stateName = currentStateObj.name.toLowerCase();
    const stateId = currentStateObj.id.toLowerCase();
    const cityName = currentCityObj.name.toLowerCase();
    const cityId = currentCityObj.id.toLowerCase();
    const authId = selectedAuthorityId.toLowerCase();
    const authShortName = currentAuthorityObj?.shortName?.toLowerCase() || '';
    const authName = currentAuthorityObj?.name?.toLowerCase() || '';

    // Filter rules relevant to this location
    const matched = OFFICIAL_BYE_LAWS_DATABASE.map(rule => {
      let matchScore = 0; // 5=Direct Local Auth, 4=City Auth, 3=City MP, 2=State, 1=National/Overlay, 0=None
      let relevanceBadge: 'direct_local' | 'location_relevant' | 'reference_standard' | 'general_info' = 'general_info';
      let statusLabel = 'General Information';

      const rState = rule.jurisdictionScope?.state?.toLowerCase();
      const rStateId = rule.jurisdictionScope?.stateId?.toLowerCase();
      const rCity = rule.jurisdictionScope?.city?.toLowerCase();
      const rCityId = rule.jurisdictionScope?.cityId?.toLowerCase();
      const rAuth = rule.jurisdictionScope?.authority?.toLowerCase();
      const rAuthId = rule.jurisdictionScope?.authorityId?.toLowerCase();
      const rJurisdiction = rule.jurisdiction.toLowerCase();

      // LEVEL 1: National Regulations (Pan-India Standards)
      if (rule.level === 1) {
        matchScore = 1;
        relevanceBadge = 'reference_standard';
        statusLabel = 'National Reference Standard (NBC 2016)';
      }
      // LEVEL 2: State Building Codes
      else if (rule.level === 2) {
        const isStateMatch = (rStateId && rStateId === stateId) || 
                             (rState && (rState === stateName || stateName.includes(rState) || rState.includes(stateName))) ||
                             rJurisdiction.includes(stateName) ||
                             rJurisdiction.includes(stateId);
        if (isStateMatch) {
          matchScore = 2;
          relevanceBadge = 'location_relevant';
          statusLabel = 'State Building Code';
        }
      }
      // LEVEL 3: City Master Plans / Development Plans
      else if (rule.level === 3) {
        const isCityMatch = (rCityId && rCityId === cityId) ||
                            (rCity && (rCity === cityName || cityName.includes(rCity) || rCity.includes(cityName))) ||
                            rJurisdiction.includes(cityName) ||
                            rJurisdiction.includes(cityId);
        if (isCityMatch) {
          matchScore = 3;
          relevanceBadge = 'location_relevant';
          statusLabel = 'Location Relevant (Master Plan)';
        }
      }
      // LEVEL 4: Local Authority Rules & Pan-India Overlays
      else if (rule.level === 4) {
        const hasLocationScope = Boolean(rState || rStateId || rCity || rCityId || rAuth || rAuthId);

        if (!hasLocationScope) {
          // Pan-India Statutory Overlay (AAI CCZM, NHAI, Railways, ASI, NGT, CEA, Fire, CGWA, Tree)
          matchScore = 1;
          relevanceBadge = 'reference_standard';
          statusLabel = 'Pan-India Statutory Overlay';
        } else {
          // Local Authority Specific Rule - MUST match the selected authority or city
          const isDirectAuthMatch = Boolean(
            (authId && rAuthId && (rAuthId === authId || authId.includes(rAuthId) || rAuthId.includes(authId))) ||
            (authShortName && (rJurisdiction.includes(authShortName) || (rAuth && rAuth.includes(authShortName)))) ||
            (authName && rAuth && (rAuth.includes(authName) || authName.includes(rAuth)))
          );

          const isCityAuthMatch = Boolean(
            (rCityId && rCityId === cityId) ||
            (rCity && (rCity === cityName || cityName.includes(rCity) || rCity.includes(cityName))) ||
            rJurisdiction.includes(cityName)
          );

          if (isDirectAuthMatch) {
            matchScore = 5;
            relevanceBadge = 'direct_local';
            statusLabel = 'Primary Local Authority Rule';
          } else if (isCityAuthMatch) {
            matchScore = 4;
            relevanceBadge = 'direct_local';
            statusLabel = 'Local Authority Rule';
          }
          // Note: If rule belongs to another city (e.g. MCGM, GHMC, CMDA when viewing Gurugram), matchScore remains 0 and is excluded!
        }
      }

      return {
        rule,
        matchScore,
        relevanceBadge,
        statusLabel
      };
    }).filter(item => item.matchScore > 0);

    // Sort by match score descending (Direct Local Auth -> City Auth -> City MP -> State -> National/Overlay)
    matched.sort((a, b) => b.matchScore - a.matchScore);

    return matched;
  }, [currentStateObj, currentCityObj, currentAuthorityObj, selectedAuthorityId]);

  // Filtered Location Regulations by Category & Search
  const filteredLocationRegulations = useMemo(() => {
    return locationRegulationsStack.filter(({ rule }) => {
      const matchCategory = selectedCategoryFilter === 'all' || 
        rule.category === selectedCategoryFilter ||
        (selectedCategoryFilter === 'environment' && (rule.category === 'environmental_regulations' || rule.category === 'rainwater_harvesting' || rule.category === 'solar_requirements')) ||
        (selectedCategoryFilter === 'approval' && (rule.category === 'approvals_sanctions' || rule.category === 'completion_occupancy_certificate'));
      const query = adminSearch.toLowerCase().trim();
      const matchSearch = !query || 
        rule.title.toLowerCase().includes(query) || 
        rule.clause.toLowerCase().includes(query) || 
        rule.sourceDoc.toLowerCase().includes(query) || 
        rule.summary.toLowerCase().includes(query);

      return matchCategory && matchSearch;
    });
  }, [locationRegulationsStack, selectedCategoryFilter, adminSearch]);

  // Global All Regulations for Browse All Tab
  const globalFilteredRegulations = useMemo(() => {
    return OFFICIAL_BYE_LAWS_DATABASE.filter(rule => {
      const matchLevel = selectedLevelFilter === 'all' || rule.level === selectedLevelFilter;
      const matchCategory = selectedCategoryFilter === 'all' || 
        rule.category === selectedCategoryFilter ||
        (selectedCategoryFilter === 'environment' && (rule.category === 'environmental_regulations' || rule.category === 'rainwater_harvesting' || rule.category === 'solar_requirements')) ||
        (selectedCategoryFilter === 'approval' && (rule.category === 'approvals_sanctions' || rule.category === 'completion_occupancy_certificate'));
      const matchJurisdiction = selectedJurisdictionFilter === 'all' || rule.jurisdiction.toLowerCase().includes(selectedJurisdictionFilter.toLowerCase());
      const query = adminSearch.toLowerCase().trim();
      const matchSearch = !query || 
        rule.title.toLowerCase().includes(query) || 
        rule.clause.toLowerCase().includes(query) || 
        rule.sourceDoc.toLowerCase().includes(query) || 
        rule.summary.toLowerCase().includes(query) ||
        rule.jurisdiction.toLowerCase().includes(query);

      return matchLevel && matchCategory && matchJurisdiction && matchSearch;
    });
  }, [selectedLevelFilter, selectedCategoryFilter, selectedJurisdictionFilter, adminSearch]);

  // Relevance Badge Renderer
  const getRelevanceBadge = (relevance: 'direct_local' | 'location_relevant' | 'reference_standard' | 'general_info') => {
    switch (relevance) {
      case 'direct_local':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3 text-emerald-500" /> Directly Applicable
          </span>
        );
      case 'location_relevant':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <MapPin className="w-3 h-3 text-amber-500" /> Location Relevant
          </span>
        );
      case 'reference_standard':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Landmark className="w-3 h-3 text-blue-500" /> Reference Standard
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            <HelpCircle className="w-3 h-3" /> General Information
          </span>
        );
    }
  };

  // Level Badge Renderer
  const getLevelBadge = (level: number) => {
    switch (level) {
      case 1:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">Level 1: National (NBC 2016)</span>;
      case 2:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20">Level 2: State Code</span>;
      case 3:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">Level 3: Master Plan</span>;
      case 4:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">Level 4: Local Authority</span>;
      default:
        return null;
    }
  };

  // Status Badge Helper
  const getComplianceStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
          </span>
        );
      case 'conditional':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" /> Conditional
          </span>
        );
      case 'non_compliant':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400">
            <XCircle className="w-3.5 h-3.5" /> Exceeds Limit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 border border-slate-500/20">
            <HelpCircle className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 md:p-6 shadow-xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase bg-indigo-500/30 text-indigo-300 rounded border border-indigo-400/30">
                Architecture & Statutory Feasibility
              </span>
              <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                Location-Aware Bye-Law Engine
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-400" />
              Building Feasibility & Bye-Law Checker
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl">
              Location-aware architectural feasibility engine. Evaluates FAR/FSI, setbacks, massing, parking, fire safety, and statutory clearances across 4 levels of Indian regulations.
            </p>
          </div>

          {/* Quick Dual View & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setViewMode('client')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'client'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Simple View
              </button>
              <button
                onClick={() => setViewMode('technical')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'technical'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" /> Technical View
              </button>
            </div>

            <button
              onClick={() => generateFeasibilityPdf(report)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md transition active:scale-95"
            >
              <Download className="w-4 h-4" /> Download PDF Report
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 border-t border-slate-800 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'wizard'
                ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4" /> 1. Feasibility Assessment
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'matrix'
                ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" /> 2. Compliance Matrix & Approvals
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'ai'
                ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> 3. Ask AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'database'
                ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-400" /> 4. Regulations Database ({ALL_REGULATION_DOCUMENTS.length})
          </button>
        </div>
      </div>

      {/* TAB 1: FEASIBILITY ASSESSMENT (WIZARD & REPORT DASHBOARD) */}
      {activeTab === 'wizard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 4-Step Input Wizard (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
              {/* Wizard Step Navigation */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Step {wizardStep} of 4: {
                    wizardStep === 1 ? 'Site Location' :
                    wizardStep === 2 ? 'Plot Dimensions' :
                    wizardStep === 3 ? 'Proposed Building' : 'Site Conditions'
                  }
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map(s => (
                    <button
                      key={s}
                      onClick={() => setWizardStep(s)}
                      className={`w-6 h-6 rounded-full text-xs font-bold transition flex items-center justify-center ${
                        wizardStep === s
                          ? 'bg-indigo-600 text-white'
                          : wizardStep > s
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {wizardStep > s ? '✓' : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 1: SITE LOCATION */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      State / UT Jurisdiction
                    </label>
                    <select
                      value={selectedStateId}
                      onChange={(e) => handleStateSelect(e.target.value)}
                      className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {JURISDICTION_INDEX.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.stateBuildingCode.split('(')[0]})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      City
                    </label>
                    <select
                      value={selectedCityId}
                      onChange={(e) => handleCitySelect(e.target.value)}
                      className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {currentStateObj.cities.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Governing Planning Authority
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNotSureHelpModal(true)}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-semibold"
                      >
                        <HelpCircle className="w-3 h-3" /> Not sure?
                      </button>
                    </div>
                    <select
                      value={isNotSureAuthority ? 'not_sure' : selectedAuthorityId}
                      onChange={(e) => handleAuthoritySelect(e.target.value)}
                      className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {currentCityObj.authorities.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                      <option value="not_sure">I am not sure — show city-level regulations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Designated Master Plan Zone
                    </label>
                    <select
                      value={siteLocation.zone}
                      onChange={(e) => setSiteLocation({ ...siteLocation, zone: e.target.value })}
                      className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {(currentAuthorityObj?.availableZones || ['Residential Plotted', 'Commercial', 'Mixed Land Use', 'Institutional']).map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Fronting Road Width (Meters)
                      </label>
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {siteLocation.roadWidth} m ({(siteLocation.roadWidth * 3.28084).toFixed(1)} ft)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      {[6, 9, 12, 18, 24, 30].map(rw => (
                        <button
                          key={rw}
                          type="button"
                          onClick={() => setSiteLocation({ ...siteLocation, roadWidth: rw })}
                          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                            siteLocation.roadWidth === rw
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {rw}m
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      min="3"
                      max="100"
                      value={siteLocation.roadWidth}
                      onChange={(e) => setSiteLocation({ ...siteLocation, roadWidth: parseFloat(e.target.value) || 3 })}
                      className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Locality / Sector
                      </label>
                      <input
                        type="text"
                        value={siteLocation.locality || ''}
                        onChange={(e) => setSiteLocation({ ...siteLocation, locality: e.target.value })}
                        placeholder="e.g. Sector 57 / Tonk Road"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        value={siteLocation.pinCode || ''}
                        onChange={(e) => setSiteLocation({ ...siteLocation, pinCode: e.target.value })}
                        placeholder="e.g. 302001"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PLOT DIMENSIONS & UNIT CONVERTER */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Plot Area & Input Unit
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={plotInfo.plotArea}
                        onChange={(e) => setPlotInfo({ ...plotInfo, plotArea: parseFloat(e.target.value) || 0 })}
                        className="w-2/3 px-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <select
                        value={plotInfo.areaUnit}
                        onChange={(e) => setPlotInfo({ ...plotInfo, areaUnit: e.target.value as AreaUnit })}
                        className="w-1/3 px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                      >
                        <option value="sq_m">Sq. Meters (m²)</option>
                        <option value="sq_ft">Sq. Feet (ft²)</option>
                        <option value="sq_yd">Sq. Yards (Gaj)</option>
                        <option value="guntha">Guntha</option>
                        <option value="bigha">Bigha (Local)</option>
                        <option value="acre">Acre</option>
                      </select>
                    </div>

                    {/* Live multi-unit conversion pill */}
                    <div className="mt-2 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-slate-700 dark:text-indigo-200 text-xs flex flex-wrap items-center justify-between gap-2">
                      <span>Normalized Area:</span>
                      <div className="flex flex-wrap gap-2 font-mono font-bold text-[11px]">
                        <span className="text-indigo-600 dark:text-indigo-300">{normalizedArea.sqM.toFixed(1)} m²</span>
                        <span>•</span>
                        <span>{normalizedArea.sqFt.toLocaleString('en-IN')} ft²</span>
                        <span>•</span>
                        <span>{(normalizedArea.sqFt / 9).toFixed(1)} Gaj</span>
                      </div>
                    </div>
                  </div>

                  {/* Linear Dimension Unit Selector & Dimension Inputs */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Plot Dimensions Unit
                      </label>
                      <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => handleDimensionUnitChange('m')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                            !isDimInFt
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Meters (m)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDimensionUnitChange('ft')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                            isDimInFt
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Feet (ft)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Frontage Width ({isDimInFt ? 'ft' : 'm'})
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">
                            ≈ {(isDimInFt ? plotInfo.frontageWidth * 0.3048 : plotInfo.frontageWidth * 3.28084).toFixed(1)} {isDimInFt ? 'm' : 'ft'}
                          </span>
                        </div>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={plotInfo.frontageWidth}
                          onChange={(e) => setPlotInfo({ ...plotInfo, frontageWidth: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Plot Depth ({isDimInFt ? 'ft' : 'm'})
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">
                            ≈ {(isDimInFt ? plotInfo.plotDepth * 0.3048 : plotInfo.plotDepth * 3.28084).toFixed(1)} {isDimInFt ? 'm' : 'ft'}
                          </span>
                        </div>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={plotInfo.plotDepth}
                          onChange={(e) => setPlotInfo({ ...plotInfo, plotDepth: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Calculated Footprint from Dimensions with 1-Click Sync */}
                    {computedAreaFromDimensions && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
                            Area from Dimensions ({plotInfo.frontageWidth} {isDimInFt ? 'ft' : 'm'} × {plotInfo.plotDepth} {isDimInFt ? 'ft' : 'm'}):
                          </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {computedAreaFromDimensions.sqFt.toLocaleString('en-IN')} ft² ({computedAreaFromDimensions.sqM.toFixed(1)} m²)
                          </span>
                        </div>
                        {Math.abs(normalizedArea.sqFt - computedAreaFromDimensions.sqFt) > 1 ? (
                          <button
                            type="button"
                            onClick={handleApplyDimensionArea}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition flex items-center gap-1 shrink-0"
                          >
                            <Sparkles className="w-3 h-3" /> Sync as Plot Area
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                            <Check className="w-3.5 h-3.5" /> Matches Plot Area
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Plot Geometry Checkboxes */}
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={plotInfo.isCornerPlot}
                        onChange={(e) => setPlotInfo({ ...plotInfo, isCornerPlot: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      Corner Plot (Frontage on 2 or more roads)
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={plotInfo.isIrregularPlot}
                        onChange={(e) => setPlotInfo({ ...plotInfo, isIrregularPlot: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      Irregular / Non-Rectangular Polygon Plot
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={plotInfo.hasExistingStructure}
                        onChange={(e) => setPlotInfo({ ...plotInfo, hasExistingStructure: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      Existing Building on Site (Redevelopment / Extension)
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 3: PROPOSED DEVELOPMENT */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Proposed Building Occupancy / Use
                    </label>
                    <select
                      value={proposal.buildingUse}
                      onChange={(e) => setProposal({ ...proposal, buildingUse: e.target.value as BuildingUse })}
                      className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="residential_plotted">Residential Plotted (Independent / Floors)</option>
                      <option value="residential_group_housing">Residential Group Housing (Apartments)</option>
                      <option value="commercial_retail">Commercial Retail / SCO / Shopping Complex</option>
                      <option value="commercial_office">Commercial Office / IT Complex</option>
                      <option value="mixed_use">Mixed Use (Retail Ground + Residential/Office Above)</option>
                      <option value="institutional">Institutional / Community Building</option>
                      <option value="educational">Educational (School / College)</option>
                      <option value="hospitality">Hospitality / Hotel</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Proposed Floors
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={proposal.proposedFloors}
                        onChange={(e) => setProposal({ ...proposal, proposedFloors: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Dwelling Units / Flats
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={proposal.dwellingUnits || 1}
                        onChange={(e) => setProposal({ ...proposal, dwellingUnits: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Stilt & Basement Toggles */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={proposal.hasStilt}
                        onChange={(e) => setProposal({ ...proposal, hasStilt: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Stilt Floor (Parking)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={proposal.hasBasement}
                        onChange={(e) => setProposal({ ...proposal, hasBasement: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Basement Floor</span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 4: SPECIAL SITE CONDITIONS */}
              {wizardStep === 4 && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select any statutory overlay restrictions within proximity of your plot:
                  </p>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conditions.nearAirport}
                      onChange={(e) => setConditions({ ...conditions, nearAirport: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-600"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Airport Funnel / AAI Zone (Within 20km)</span>
                      <span className="text-slate-500 text-[11px]">Requires AAI NOCAS-2 Colour Coded Zoning Map height clearance.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conditions.nearHighway}
                      onChange={(e) => setConditions({ ...conditions, nearHighway: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-600"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">National / State Highway Frontage</span>
                      <span className="text-slate-500 text-[11px]">Triggers NHAI 12m building line buffer & access clearance.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conditions.nearRailway}
                      onChange={(e) => setConditions({ ...conditions, nearRailway: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-600"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Railway Track within 30m</span>
                      <span className="text-slate-500 text-[11px]">Mandatory Divisional Railway Manager (DRM) safety NOC.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conditions.inHeritageZone}
                      onChange={(e) => setConditions({ ...conditions, inHeritageZone: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-600"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Heritage Monument / ASI Protected Zone</span>
                      <span className="text-slate-500 text-[11px]">100m prohibited zone / 300m NMA regulated zone.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={conditions.nearWaterBodyOrNallah}
                      onChange={(e) => setConditions({ ...conditions, nearWaterBodyOrNallah: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-600"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Water Body / Nallah Buffer (NGT Zone)</span>
                      <span className="text-slate-500 text-[11px]">Mandatory 30m primary nallah / 50m river non-construction buffer.</span>
                    </div>
                  </label>
                </div>
              )}

              {/* Step Navigation Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={wizardStep === 1}
                  onClick={() => setWizardStep(prev => Math.max(1, prev - 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(prev => Math.min(4, prev + 1))}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                >
                  {wizardStep === 4 ? 'Review Report' : 'Next Step'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2D Interactive Plot Envelope SVG Visualizer */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-500" />
                  2D Plot & Buildable Envelope Diagram
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {isDimInFt
                    ? `${plotInfo.frontageWidth} ft × ${plotInfo.plotDepth} ft (${(plotInfo.frontageWidth * 0.3048).toFixed(1)}m × ${(plotInfo.plotDepth * 0.3048).toFixed(1)}m)`
                    : `${plotInfo.frontageWidth}m × ${plotInfo.plotDepth}m (${(plotInfo.frontageWidth * 3.28084).toFixed(1)} ft × ${(plotInfo.plotDepth * 3.28084).toFixed(1)} ft)`}
                </span>
              </div>

              {plotInfo.isIrregularPlot ? (
                <div className="h-48 rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 p-4 flex flex-col items-center justify-center text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    Irregular Plot Geometry Active
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400 max-w-xs">
                    Standard rectangular envelope preview is suppressed. Statutory setbacks apply along each individual boundary segment.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative bg-slate-950 rounded-xl p-3 flex items-center justify-center">
                    <svg className="w-full h-52 max-h-52" viewBox="0 0 300 200">
                      {/* Plot Background (Total Plot) */}
                      <rect
                        x="30"
                        y="18"
                        width="240"
                        height="152"
                        fill="#1e293b"
                        stroke="#475569"
                        strokeWidth="2"
                        rx="4"
                      />

                      {/* Setback Shading Bands */}
                      <rect x="30" y="142" width="240" height="28" fill="#ef4444" fillOpacity="0.15" />
                      <rect x="30" y="18" width="240" height="26" fill="#ef4444" fillOpacity="0.15" />
                      <rect x="30" y="44" width="25" height="98" fill="#ef4444" fillOpacity="0.15" />
                      <rect x="245" y="44" width="25" height="98" fill="#ef4444" fillOpacity="0.15" />

                      {/* Net Buildable Envelope (Green Box) */}
                      <rect
                        x="55"
                        y="44"
                        width="190"
                        height="98"
                        fill="#10b981"
                        fillOpacity="0.3"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        rx="2"
                      />

                      {/* Side Setback Mini Labels */}
                      <text x="42" y="93" fill="#f87171" fontSize="7" fontWeight="bold" textAnchor="middle">
                        {report.developmentControls.setbacks.leftM}m
                      </text>
                      <text x="258" y="93" fill="#f87171" fontSize="7" fontWeight="bold" textAnchor="middle">
                        {report.developmentControls.setbacks.rightM}m
                      </text>

                      {/* Inside Buildable Envelope: Titles, Width, Depth & Footprint Area */}
                      <text x="150" y="66" fill="#34d399" fontSize="9.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">
                        BUILDABLE FOOTPRINT
                      </text>
                      <text x="150" y="83" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                        Width: {report.developmentControls.envelope.buildableWidthM} m ({(report.developmentControls.envelope.buildableWidthM * 3.28084).toFixed(1)} ft)
                      </text>
                      <text x="150" y="99" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                        Depth: {report.developmentControls.envelope.buildableDepthM} m ({(report.developmentControls.envelope.buildableDepthM * 3.28084).toFixed(1)} ft)
                      </text>
                      <text x="150" y="115" fill="#a7f3d0" fontSize="8.5" textAnchor="middle">
                        Area: {report.developmentControls.envelope.buildableFootprintSqM} m² / {(report.developmentControls.envelope.buildableFootprintSqM * 10.7639).toFixed(0)} ft² ({report.developmentControls.envelope.envelopeEfficiencyPct}%)
                      </text>

                      {/* Front and Rear Setback Annotations */}
                      <text x="150" y="159" fill="#f87171" fontSize="8" fontWeight="medium" textAnchor="middle">
                        Front Setback: {report.developmentControls.setbacks.frontM}m ({(report.developmentControls.setbacks.frontM * 3.28084).toFixed(1)} ft)
                      </text>
                      <text x="150" y="33" fill="#f87171" fontSize="8" fontWeight="medium" textAnchor="middle">
                        Rear Setback: {report.developmentControls.setbacks.rearM}m ({(report.developmentControls.setbacks.rearM * 3.28084).toFixed(1)} ft)
                      </text>

                      {/* Road Indication */}
                      <rect x="10" y="176" width="280" height="18" fill="#0f172a" stroke="#334155" rx="2" />
                      <text x="150" y="188" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
                        ▼ ROAD FRONTAGE ({siteLocation.roadWidth}m / {(siteLocation.roadWidth * 3.28084).toFixed(1)}ft WIDE) ▼
                      </text>
                    </svg>
                  </div>

                  {/* 3-Column Buildable Footprint Dimension Pills */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-0.5">
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">
                        Buildable Width
                      </span>
                      <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                        {report.developmentControls.envelope.buildableWidthM} m
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 block">
                        {(report.developmentControls.envelope.buildableWidthM * 3.28084).toFixed(1)} ft
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-0.5">
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">
                        Buildable Depth
                      </span>
                      <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                        {report.developmentControls.envelope.buildableDepthM} m
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 block">
                        {(report.developmentControls.envelope.buildableDepthM * 3.28084).toFixed(1)} ft
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 space-y-0.5">
                      <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 block">
                        Net Footprint Area
                      </span>
                      <div className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-200">
                        {report.developmentControls.envelope.buildableFootprintSqM} m²
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 block">
                        {(report.developmentControls.envelope.buildableFootprintSqM * 10.7639).toFixed(0)} ft²
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Feasibility Report Dashboard (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Executive Status Card */}
            <div className={`rounded-2xl p-5 border shadow-sm transition ${
              report.executiveSummary.status === 'feasible'
                ? 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/20'
                : report.executiveSummary.status === 'conditional'
                ? 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/20'
                : 'bg-rose-500/10 border-rose-500/30 dark:bg-rose-950/20'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {report.executiveSummary.status === 'feasible' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : report.executiveSummary.status === 'conditional' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    )}
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {report.executiveSummary.headline}
                    </h2>
                  </div>
                  <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300">
                    {report.executiveSummary.summaryText}
                  </p>
                </div>
                <button
                  onClick={handleCopySummary}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Critical Flags / Highlights */}
              {report.executiveSummary.criticalFlags.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                    Attention Flags & Requirements:
                  </span>
                  <ul className="space-y-1 text-xs text-rose-800 dark:text-rose-300">
                    {report.executiveSummary.criticalFlags.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-500">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Base FAR / Max FAR</span>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                  {report.developmentControls.far.baseFar} <span className="text-xs text-indigo-500">/ {report.developmentControls.far.effectiveMaxFar}</span>
                </div>
                <span className="text-[10px] text-slate-500">Max BUA: {report.developmentControls.far.permittedMaxBuaSqM.toFixed(0)} m² ({(report.developmentControls.far.permittedMaxBuaSqM * 10.7639).toFixed(0)} ft²)</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Max Ground Coverage</span>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                  {report.developmentControls.groundCoverage.permittedMaxPct}%
                </div>
                <span className="text-[10px] text-slate-500">{report.developmentControls.groundCoverage.permittedMaxSqM.toFixed(1)} m² ({(report.developmentControls.groundCoverage.permittedMaxSqM * 10.7639).toFixed(0)} ft²)</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Max Height / Floors</span>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                  {report.developmentControls.heightFloors.maxPermissibleHeightM}m <span className="text-xs font-normal text-slate-400">({(report.developmentControls.heightFloors.maxPermissibleHeightM * 3.28084).toFixed(1)} ft)</span>
                </div>
                <span className="text-[10px] text-slate-500">{report.developmentControls.heightFloors.maxPermissibleFloors} Permitted Floors</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Parking Required</span>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                  {report.developmentControls.parking.requiredEcs} ECS
                </div>
                <span className="text-[10px] text-slate-500">+{report.developmentControls.parking.evChargingEcs} EV Fast Bays</span>
              </div>
            </div>

            {/* Development Controls Comparison Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-indigo-500" />
                  Development Controls & Setbacks
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  {report.resolvedJurisdiction.primaryCode}
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {/* Ground Coverage */}
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Ground Coverage</span>
                    <span className="text-slate-500 text-[11px]">
                      Permitted: Max {report.developmentControls.groundCoverage.permittedMaxPct}% ({report.developmentControls.groundCoverage.permittedMaxSqM.toFixed(1)} m² / {(report.developmentControls.groundCoverage.permittedMaxSqM * 10.7639).toFixed(0)} ft²)
                      {viewMode === 'technical' && ` • Clause: ${report.developmentControls.groundCoverage.clause}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {report.developmentControls.groundCoverage.proposedPct}% ({report.developmentControls.groundCoverage.proposedSqM.toFixed(1)} m² / {(report.developmentControls.groundCoverage.proposedSqM * 10.7639).toFixed(0)} ft²)
                    </span>
                    {getComplianceStatusBadge(report.developmentControls.groundCoverage.status)}
                  </div>
                </div>

                {/* FAR / FSI */}
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Floor Area Ratio (FAR / FSI)</span>
                    <span className="text-slate-500 text-[11px]">
                      Base: {report.developmentControls.far.baseFar} | Purchasable: +{report.developmentControls.far.maxPurchasableFar}
                      {viewMode === 'technical' && ` • Clause: ${report.developmentControls.far.clause}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      FAR {report.developmentControls.far.proposedFar} ({report.developmentControls.far.proposedBuaSqM.toFixed(0)} m² / {(report.developmentControls.far.proposedBuaSqM * 10.7639).toFixed(0)} ft² BUA)
                    </span>
                    {getComplianceStatusBadge(report.developmentControls.far.status)}
                  </div>
                </div>

                {/* Setbacks */}
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Mandatory Setbacks</span>
                    <span className="text-slate-500 text-[11px]">
                      Front: {report.developmentControls.setbacks.frontM}m ({(report.developmentControls.setbacks.frontM * 3.28084).toFixed(1)}ft) • Rear: {report.developmentControls.setbacks.rearM}m ({(report.developmentControls.setbacks.rearM * 3.28084).toFixed(1)}ft) • Sides: {report.developmentControls.setbacks.leftM}m ({(report.developmentControls.setbacks.leftM * 3.28084).toFixed(1)}ft)
                      {viewMode === 'technical' && ` • Clause: ${report.developmentControls.setbacks.clause}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      Standard
                    </span>
                    {getComplianceStatusBadge('compliant')}
                  </div>
                </div>

                {/* Height & Floors */}
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Building Height & Floors</span>
                    <span className="text-slate-500 text-[11px]">
                      Permitted: Max {report.developmentControls.heightFloors.maxPermissibleHeightM}m ({(report.developmentControls.heightFloors.maxPermissibleHeightM * 3.28084).toFixed(1)} ft) ({report.developmentControls.heightFloors.maxPermissibleFloors} Floors)
                      {viewMode === 'technical' && ` • ${report.developmentControls.heightFloors.roadWidthFormula}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {report.developmentControls.heightFloors.proposedHeightM.toFixed(1)}m ({(report.developmentControls.heightFloors.proposedHeightM * 3.28084).toFixed(1)} ft) ({report.developmentControls.heightFloors.proposedFloors} Fl)
                    </span>
                    {getComplianceStatusBadge(report.developmentControls.heightFloors.status)}
                  </div>
                </div>

                {/* Parking ECS */}
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Vehicular Parking (ECS)</span>
                    <span className="text-slate-500 text-[11px]">
                      Mandatory: {report.developmentControls.parking.requiredEcs} ECS (+{report.developmentControls.parking.visitorEcs} Visitor, {report.developmentControls.parking.evChargingEcs} EV)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {report.developmentControls.parking.proposedEcs} ECS
                    </span>
                    {getComplianceStatusBadge(report.developmentControls.parking.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Life Safety & Sustainability Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Fire & Life Safety (NBC Part 4)
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <li>• High-Rise (&ge;15m): <span className="font-bold">{report.lifeSafetyAndServices.fireSafety.isHighRise ? 'Yes (Fire NOC Required)' : 'No (<15m Low-Rise)'}</span></li>
                  <li>• Min Access Road: <span className="font-mono font-bold">{report.lifeSafetyAndServices.fireSafety.minAccessRoadM}m</span> (Site has {siteLocation.roadWidth}m)</li>
                  <li>• Max Exit Travel: <span className="font-mono">{report.lifeSafetyAndServices.fireSafety.maxTravelDistanceM}m</span></li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Trees className="w-4 h-4 text-emerald-500" />
                  Environmental & Sustainability
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <li>• Rainwater Harvesting: <span className="font-bold">{report.lifeSafetyAndServices.environment.rwhRequired ? `Mandatory (${report.lifeSafetyAndServices.environment.rwhTankCapacityLiters}L Tank)` : 'Optional'}</span></li>
                  <li>• Solar PV Mandate: <span className="font-bold">{report.lifeSafetyAndServices.environment.solarPvRequired ? `Mandatory (Min ${report.lifeSafetyAndServices.environment.minSolarCapacityKw} kWp)` : 'Exempt'}</span></li>
                  <li>• Dedicated STP: <span className="font-bold">{report.lifeSafetyAndServices.environment.stpRequired ? 'Mandatory' : 'Municipal Line Permitted'}</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPLIANCE MATRIX & STATUTORY APPROVALS */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Compliance Matrix Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                Comprehensive Statutory Compliance Matrix
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Jurisdiction: {report.resolvedJurisdiction.stateName}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Category & Parameter</th>
                    <th className="p-3">Statutory Permissible</th>
                    <th className="p-3">Proposed Parameter</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Clause Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {report.complianceMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        <div>{item.parameter}</div>
                        <div className="text-[10px] text-slate-400">{item.category}</div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 font-mono">{item.permitted}</td>
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-100">{item.proposed}</td>
                      <td className="p-3">{getComplianceStatusBadge(item.status)}</td>
                      <td className="p-3 text-[11px] text-slate-500">
                        <div>{item.clause}</div>
                        <div className="text-[10px] text-slate-400">{item.sourceDoc}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Approvals Roadmap */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              Statutory Clearances & Approvals Roadmap
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.approvalsChecklist.map((app) => (
                <div key={app.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {app.stage}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{app.timelineDays}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {app.approvalName}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Authority: <span className="font-semibold text-slate-700 dark:text-slate-300">{app.authority}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    {app.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GROUNDED AI ASSISTANT ("ASK ABOUT YOUR REPORT") */}
      {activeTab === 'ai' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                  Feasibility Grounded AI Assistant
                </h3>
                <p className="text-[11px] text-slate-500">
                  Strictly grounded in your current Feasibility Report clauses and statutory bye-laws.
                </p>
              </div>
            </div>
            <button
              onClick={() => setChatMessages([])}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear Chat
            </button>
          </div>

          {/* Prompt Suggestion Chips */}
          <div className="flex flex-wrap gap-2">
            {DEFAULT_SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendAiQuestion(prompt)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition"
              >
                💬 {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="min-h-[280px] max-h-[420px] overflow-y-auto space-y-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800">
            {chatMessages.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <Sparkles className="w-6 h-6 text-amber-500/60" />
                <p className="text-xs font-semibold">Click a suggested question above or type your inquiry.</p>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  You can ask about Stilt+4 rules, purchasable FAR, statutory setbacks, parking ECS, fire NOC, or approvals.
                </p>
              </div>
            ) : (
              chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl p-3.5 text-xs shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                    {msg.citedClauses && msg.citedClauses.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-[10px] text-indigo-600 dark:text-indigo-400">
                        <BookOpen className="w-3 h-3" />
                        <span>Clauses Cited: {msg.citedClauses.join(' • ')}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 px-1">{msg.timestamp}</span>
                </div>
              ))
            )}
          </div>

          {/* User Input Bar */}
          <div className="flex gap-2">
            <input
              type="text"
              value={userInputText}
              onChange={(e) => setUserInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendAiQuestion(userInputText)}
              placeholder="Ask anything about your feasibility report (e.g. Can I build G+4? How much parking is required?)..."
              className="flex-1 px-4 py-2.5 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleSendAiQuestion(userInputText)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition active:scale-95"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: LOCATION-BASED BYE-LAW DISCOVERY & DATABASE EXPLORER */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* DATABASE COVERAGE & PLATFORM METRICS DASHBOARD */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 rounded-2xl border border-indigo-500/30 p-5 md:p-6 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    Authoritative Bye-Laws & Regulations Knowledge Base
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Official Sources Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  India-wide repository of official statutory building codes, unified DCRs, city master plans, and development authority regulations.
                </p>
              </div>

              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                <span className="text-[11px] text-slate-400 font-medium">Database Coverage</span>
                <span className="text-xs font-bold text-indigo-300 font-mono">
                  {GLOBAL_PLATFORM_STATS.totalStatesSupported} of {GLOBAL_PLATFORM_STATS.totalStates} States & UTs Active
                </span>
              </div>
            </div>

            {/* 4 Stat KPI Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-lg">
                  📚
                </div>
                <div>
                  <div className="text-base font-bold text-white font-mono">{ALL_REGULATION_DOCUMENTS.length}</div>
                  <div className="text-[10px] text-slate-400">Official Documents</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-lg">
                  🇮🇳
                </div>
                <div>
                  <div className="text-base font-bold text-white font-mono">{GLOBAL_PLATFORM_STATS.totalStates} States</div>
                  <div className="text-[10px] text-slate-400">{GLOBAL_PLATFORM_STATS.totalStatesSupported} Active Indexed</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center text-lg">
                  🏙️
                </div>
                <div>
                  <div className="text-base font-bold text-white font-mono">{GLOBAL_PLATFORM_STATS.totalCitiesSupported} Cities</div>
                  <div className="text-[10px] text-slate-400">Metros & Urban Hubs</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-lg">
                  🏗️
                </div>
                <div>
                  <div className="text-base font-bold text-white font-mono">{GLOBAL_PLATFORM_STATS.totalAuthoritiesSupported} Bodies</div>
                  <div className="text-[10px] text-slate-400">Development Authorities</div>
                </div>
              </div>
            </div>

            {/* Level 1 to 4 Progress Meters */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold">Level 1: National</span>
                  <span className="text-emerald-400 font-bold font-mono">100%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full rounded-full" />
                </div>
                <span className="text-[9px] text-slate-500 block">NBC 2016, ECBC, CGWA, MoHUA</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold">Level 2: State Codes</span>
                  <span className="text-indigo-400 font-bold font-mono">60%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-3/5 rounded-full" />
                </div>
                <span className="text-[9px] text-slate-500 block">UDCPR, UBBL, HBC, TNCDBR, TG</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold">Level 3: Master Plans</span>
                  <span className="text-amber-400 font-bold font-mono">45%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[45%] rounded-full" />
                </div>
                <span className="text-[9px] text-slate-500 block">MPD 2021/41, DCPR 2034, GMDA</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold">Level 4: Local / Overlays</span>
                  <span className="text-cyan-400 font-bold font-mono">40%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-2/5 rounded-full" />
                </div>
                <span className="text-[9px] text-slate-500 block">DDA, MCGM, AAI, NHAI, ASI, NGT</span>
              </div>
            </div>
          </div>
          {/* STEP 1: PROMINENT LOCATION SELECTOR ("Find Regulations for Your Location") */}
          <div className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-indigo-500/30 p-5 md:p-6 shadow-md space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Find Regulations for Your Location
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Select your project state, city, and governing planning authority to automatically discover the applicable statutory bye-law stack.
                </p>
              </div>

              {/* Geolocation Button */}
              <button
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition active:scale-95 whitespace-nowrap"
              >
                <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                {isDetectingLocation ? 'Detecting Location...' : '📍 Use My Location'}
              </button>
            </div>

            {/* Geolocation Prompt / Confirmation Banner */}
            {detectedLocationText && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Location detected: <strong>{detectedLocationText}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleConfirmDetectedLocation}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-500"
                  >
                    Confirm Location
                  </button>
                  <button
                    onClick={() => { setDetectedLocationText(null); setDetectedCoords(null); }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {locationError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
                <span>{locationError}</span>
                <button onClick={() => setLocationError(null)}><X className="w-4 h-4" /></button>
              </div>
            )}

            {/* Cascading Location Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* State Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. State / UT
                </label>
                <select
                  value={selectedStateId}
                  onChange={(e) => handleStateSelect(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                  {JURISDICTION_INDEX.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.stateCode})</option>
                  ))}
                </select>
              </div>

              {/* City Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  2. City / District
                </label>
                <select
                  value={selectedCityId}
                  onChange={(e) => handleCitySelect(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                  {currentStateObj.cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Authority Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    3. Local / Planning Authority
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNotSureHelpModal(true)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-semibold"
                  >
                    <HelpCircle className="w-3 h-3" /> Not sure?
                  </button>
                </div>
                <select
                  value={isNotSureAuthority ? 'not_sure' : selectedAuthorityId}
                  onChange={(e) => handleAuthoritySelect(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                  {currentCityObj.authorities.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.shortName})</option>
                  ))}
                  <option value="not_sure">❓ I am not sure — show city-level regulations</option>
                </select>
              </div>
            </div>

            {/* Authority Helper Notice */}
            {currentAuthorityObj && (
              <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                <Building className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{currentAuthorityObj.name}:</span> {currentAuthorityObj.jurisdictionDescription}
                </div>
              </div>
            )}
          </div>

          {/* PERSISTENT LOCATION SUMMARY BAR */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Your Selected Jurisdiction:
              </span>
              <div className="flex flex-wrap items-center gap-1 font-mono font-bold text-slate-900 dark:text-white">
                <span>India</span>
                <span className="text-slate-400">→</span>
                <span>{currentStateObj.name}</span>
                <span className="text-slate-400">→</span>
                <span>{currentCityObj.name}</span>
                {currentAuthorityObj && (
                  <>
                    <span className="text-slate-400">→</span>
                    <span className="text-indigo-600 dark:text-indigo-300">{currentAuthorityObj.shortName}</span>
                  </>
                )}
              </div>
            </div>

            {/* Mode Switcher Pills */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setDatabaseViewMode('my_location')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  databaseViewMode === 'my_location'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600'
                }`}
              >
                📍 My Location
              </button>
              <button
                onClick={() => setDatabaseViewMode('browse_all')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  databaseViewMode === 'browse_all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600'
                }`}
              >
                🌐 Browse All India
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: MY LOCATION APPLICABLE REGULATIONS VIEW */}
          {databaseViewMode === 'my_location' && (
            <div className="space-y-5">
              {/* JURISDICTION DATABASE COVERAGE METER */}
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200">
                      📊 Database Coverage for {currentCityObj.name}, {currentStateObj.name}:
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                      {jurisdictionCoverage.categoryCoveragePct}% Available
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 max-w-xs bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(10, jurisdictionCoverage.categoryCoveragePct)}%` }} 
                      />
                    </div>
                    <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                      {Object.keys(jurisdictionCoverage.categoriesCovered).length} of {MAJOR_RULE_CATEGORIES.length} major regulation categories available
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 border-t sm:border-t-0 sm:border-l border-indigo-200 dark:border-indigo-800/80 pt-2 sm:pt-0 sm:pl-3">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{jurisdictionCoverage.totalVerified} Rules Verified</span>
                </div>
              </div>

              {/* APPLICABLE REGULATION STACK CARDS */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Applicable Regulation Stack for {currentCityObj.name}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* National Stack */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400">
                      <span>1️⃣ National Level</span>
                      <span>Level 1</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">NBC 2016 & ECBC</div>
                    <span className="text-[10px] text-slate-500">Reference Standards (Life Safety & Services)</span>
                  </div>

                  {/* State Stack */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      <span>2️⃣ State Level</span>
                      <span>Level 2</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{currentStateObj.stateBuildingCode.split('(')[0]}</div>
                    <span className="text-[10px] text-slate-500">Applicable State Framework</span>
                  </div>

                  {/* City Master Plan Stack */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      <span>3️⃣ City Master Plan</span>
                      <span>Level 3</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{currentCityObj.name} Zonal Plan</div>
                    <span className="text-[10px] text-slate-500">Zoning & Land Use Permissibility</span>
                  </div>

                  {/* Local Authority Stack */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span>4️⃣ Local Authority</span>
                      <span>Level 4</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{currentAuthorityObj ? currentAuthorityObj.shortName : 'City Municipal Corp'}</div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Primary Governing Local Rules</span>
                  </div>
                </div>
              </div>

              {/* SEARCH & CATEGORY FILTERS WITHIN LOCATION */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Location-Aware Search Bar */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      placeholder={`Search regulations in ${currentCityObj.name} (e.g. FAR, Setback, Parking, Fire, Height)...`}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {filteredLocationRegulations.length} Rules Found
                  </span>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1.5 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  {[
                    { id: 'all', label: 'All Categories' },
                    { id: 'far_fsi', label: '🏗️ FAR / FSI' },
                    { id: 'setbacks', label: '📐 Setbacks' },
                    { id: 'ground_coverage', label: '🏠 Ground Coverage' },
                    { id: 'fire_safety', label: '🔥 Fire & Life Safety' },
                    { id: 'parking', label: '🚗 Parking & ECS' },
                    { id: 'accessibility', label: '♿ Accessibility' },
                    { id: 'environment', label: '🌱 Environmental & RWH' },
                    { id: 'special_restriction', label: '🛡️ Overlays & Buffers' },
                    { id: 'approval', label: '📜 Approvals & Sanctions' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryFilter(cat.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-medium transition ${
                        selectedCategoryFilter === cat.id
                          ? 'bg-indigo-600 text-white font-bold shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* LOCATION-MATCHED REGULATIONS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLocationRegulations.map(({ rule, relevanceBadge, statusLabel }) => (
                  <div 
                    key={rule.id}
                    className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm space-y-3 transition flex flex-col justify-between ${
                      relevanceBadge === 'direct_local'
                        ? 'border-emerald-500/50 hover:border-emerald-500 dark:border-emerald-500/30'
                        : relevanceBadge === 'location_relevant'
                        ? 'border-indigo-500/30 hover:border-indigo-500/60'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {getRelevanceBadge(relevanceBadge)}
                          {getLevelBadge(rule.level)}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {rule.id}
                        </span>
                      </div>

                      {/* Title & Hierarchy Status */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {rule.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{rule.jurisdiction}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">{statusLabel}</span>
                        </div>
                      </div>

                      {/* Summary Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rule.summary}
                      </p>

                      {/* Detailed Provisions Checklist */}
                      {rule.detailedRequirements && rule.detailedRequirements.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Statutory Provisions:
                          </span>
                          <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                            {rule.detailedRequirements.map((req, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-1.5">
                                <span className="text-indigo-500 font-bold">•</span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Source Verification Box & Official Source Link */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {rule.status === 'verified' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                              <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Source Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                              <AlertTriangle className="w-3 h-3 text-amber-500" /> Needs Review
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">Verified: {rule.lastVerified || 'Jan 2026'}</span>
                        </div>

                        {rule.sourceUrl && (
                          <a
                            href={rule.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
                          >
                            View Official Source <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-slate-100/60 dark:border-slate-800/60">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Clause: {rule.clause}</span>
                        <span className="text-[10px] text-slate-400">{rule.sourceDoc} ({rule.documentYear || rule.version})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: BROWSE ALL REGULATIONS ACROSS INDIA */}
          {databaseViewMode === 'browse_all' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      Browse National & All State Regulations
                    </h3>
                    <p className="text-xs text-slate-500">
                      Access official statutory bye-law rules across all states and statutory overlays.
                    </p>
                  </div>

                  {/* Filter controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={selectedJurisdictionFilter}
                      onChange={(e) => setSelectedJurisdictionFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold"
                    >
                      <option value="all">All Jurisdictions</option>
                      <option value="National">National (NBC 2016)</option>
                      <option value="Rajasthan">Rajasthan (JDA)</option>
                      <option value="Haryana">Haryana (GMDA)</option>
                      <option value="Delhi">Delhi (DDA / UBBL)</option>
                      <option value="Maharashtra">Maharashtra (UDCPR / BMC)</option>
                      <option value="Karnataka">Karnataka (BBMP / BDA)</option>
                      <option value="Tamil Nadu">Tamil Nadu (TNCDBR)</option>
                      <option value="Telangana">Telangana (GHMC)</option>
                      <option value="Uttar Pradesh">Uttar Pradesh (NOIDA)</option>
                      <option value="Gujarat">Gujarat (CGDCR)</option>
                      <option value="West Bengal">West Bengal (KMC)</option>
                    </select>

                    <input
                      type="text"
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      placeholder="Search clauses, acts..."
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Level selector */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Levels' },
                    { id: 1, label: 'Level 1: National (NBC 2016)' },
                    { id: 2, label: 'Level 2: State Codes' },
                    { id: 3, label: 'Level 3: City Master Plans' },
                    { id: 4, label: 'Level 4: Local Authority & Overlays' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      onClick={() => setSelectedLevelFilter(lvl.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        selectedLevelFilter === lvl.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* All Rules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {globalFilteredRegulations.map(rule => (
                  <div key={rule.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        {getLevelBadge(rule.level)}
                        <span className="text-[10px] font-mono text-slate-400">{rule.id}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {rule.title}
                      </h4>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block">
                        {rule.jurisdiction} • {rule.categoryName}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {rule.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Clause: <strong className="text-slate-700 dark:text-slate-300">{rule.clause}</strong></span>
                      {rule.sourceUrl && (
                        <a href={rule.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
                          Source <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* NOT SURE ABOUT JURISDICTION HELPER MODAL */}
      {showNotSureHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" />
                Which Authority Governs Your Property?
              </h3>
              <button onClick={() => setShowNotSureHelpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              In Indian metropolitan cities, multiple planning authorities govern different zones based on scheme type:
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-indigo-600" /> Development Authority (e.g. JDA, GMDA, DDA, BDA)
                </span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Governs master plan sectors, planned colonies, arterial growth corridors, and peripheral expansion zones.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-600" /> Municipal Corporation (e.g. JMC, MCG, MCD, BMC, BBMP)
                </span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Governs developed urban municipal wards, core city areas, regularized layouts, and heritage sectors.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 text-xs space-y-1">
                <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" /> Cantonment Board / Special Planning Authority
                </span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Governs defense civil areas (Cantt Boards) or special economic/IT zones (e.g. MMRDA, YEIDA, BIAAPA).
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsNotSureAuthority(true);
                  setSelectedAuthorityId('');
                  setShowNotSureHelpModal(false);
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                I am not sure — show city-level regulations
              </button>
              <button
                onClick={() => setShowNotSureHelpModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Statutory Legal Disclaimer */}
      <div className="rounded-2xl p-4 bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 text-slate-700 dark:text-slate-300 text-xs space-y-1">
        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider text-[11px]">
          <ShieldCheck className="w-4 h-4" />
          Mandatory Statutory Disclaimer & Limitation of Liability
        </div>
        <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
          This preliminary feasibility assessment is generated algorithmically for conceptual planning and advisory purposes only. It does <strong>NOT</strong> constitute a statutory building sanction, legal opinion, sanctioned architectural drawing, or structural clearance. Final building approvals must be submitted by a registered Architect (Council of Architecture) and sanctioned by the competent municipal planning authority having jurisdiction over the site.
        </p>
      </div>
    </div>
  );
}
