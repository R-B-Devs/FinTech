// ==========================
// INVESTMENTS ENDPOINTS
// ==========================

// Helper function to generate investment data (simulated for demo)
function generateInvestmentData(user_id, existingInvestments = []) {
  const investmentTypes = [
    { type: 'Mutual Fund', riskLevel: 'Medium', avgReturn: 8.5 },
    { type: 'Stocks', riskLevel: 'High', avgReturn: 12.3 },
    { type: 'Bonds', riskLevel: 'Low', avgReturn: 5.2 },
    { type: 'REIT', riskLevel: 'Medium', avgReturn: 9.1 },
    { type: 'ETF', riskLevel: 'Medium', avgReturn: 7.8 },
    { type: 'Index Fund', riskLevel: 'Low', avgReturn: 6.5 }
  ];

  const sampleInvestments = [
    { name: 'Tech Growth Fund', type: 'Mutual Fund', sector: 'Technology' },
    { name: 'Blue Chip Stocks', type: 'Stocks', sector: 'Diversified' },
    { name: 'Government Bonds', type: 'Bonds', sector: 'Government' },
    { name: 'Real Estate Trust', type: 'REIT', sector: 'Real Estate' },
    { name: 'S&P 500 ETF', type: 'ETF', sector: 'Diversified' },
    { name: 'Emerging Markets Fund', type: 'Mutual Fund', sector: 'International' },
    { name: 'Gold ETF', type: 'ETF', sector: 'Commodities' },
    { name: 'Corporate Bonds', type: 'Bonds', sector: 'Corporate' }
  ];

  // Generate realistic investment portfolio
  const numInvestments = 4 + Math.floor(Math.random() * 4); // 4-7 investments
  const selectedInvestments = sampleInvestments
    .sort(() => 0.5 - Math.random())
    .slice(0, numInvestments);

  return selectedInvestments.map((inv, index) => {
    const baseValue = 10000 + Math.floor(Math.random() * 40000); // R10k - R50k
    const typeInfo = investmentTypes.find(t => t.type === inv.type);
    const dailyChange = (Math.random() - 0.5) * 6; // -3% to +3% daily change
    const monthlyReturn = (Math.random() - 0.3) * 10; // More realistic monthly returns
    const yearlyReturn = typeInfo ? typeInfo.avgReturn + (Math.random() - 0.5) * 8 : Math.random() * 15;

    return {
      id: `inv_${user_id}_${index}`,
      name: inv.name,
      type: inv.type,
      sector: inv.sector,
      currentValue: baseValue,
      purchaseValue: Math.round(baseValue / (1 + yearlyReturn / 100)),
      dailyChange: parseFloat(dailyChange.toFixed(2)),
      monthlyReturn: parseFloat(monthlyReturn.toFixed(2)),
      yearlyReturn: parseFloat(yearlyReturn.toFixed(2)),
      riskLevel: typeInfo?.riskLevel || 'Medium',
      purchaseDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 2) * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date().toISOString()
    };
  });
}

// Helper function to calculate portfolio metrics
function calculatePortfolioMetrics(investments) {
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalCost = investments.reduce((sum, inv) => sum + inv.purchaseValue, 0);
  const totalGainLoss = totalValue - totalCost;
  const totalReturnPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  const dailyChange = investments.reduce((sum, inv) => sum + (inv.currentValue * inv.dailyChange / 100), 0);
  const dailyChangePercent = totalValue > 0 ? (dailyChange / totalValue) * 100 : 0;

  // Risk assessment
  const riskCounts = investments.reduce((counts, inv) => {
    counts[inv.riskLevel] = (counts[inv.riskLevel] || 0) + 1;
    return counts;
  }, {});

  const overallRisk = 
    (riskCounts.High || 0) > (riskCounts.Low || 0) ? 'High' :
    (riskCounts.Medium || 0) > 0 ? 'Medium' : 'Low';

  // Diversification score (0-100)
  const uniqueSectors = [...new Set(investments.map(inv => inv.sector))].length;
  const uniqueTypes = [...new Set(investments.map(inv => inv.type))].length;
  const diversificationScore = Math.min(100, (uniqueSectors * 15) + (uniqueTypes * 10) + 30);

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalReturnPercent,
    dailyChange,
    dailyChangePercent,
    overallRisk,
    diversificationScore,
    investmentCount: investments.length,
    topPerformer: investments.reduce((best, inv) => 
      inv.yearlyReturn > (best?.yearlyReturn || -Infinity) ? inv : best, null),
    worstPerformer: investments.reduce((worst, inv) => 
      inv.yearlyReturn < (worst?.yearlyReturn || Infinity) ? inv : worst, null)
  };
}

// Helper function to generate investment recommendations
function generateInvestmentRecommendations(investments, userProfile) {
  const recommendations = [];
  const metrics = calculatePortfolioMetrics(investments);

  // Diversification recommendations
  if (metrics.diversificationScore < 60) {
    recommendations.push({
      type: 'diversification',
      priority: 'high',
      title: 'Improve Portfolio Diversification',
      description: `Your diversification score is ${metrics.diversificationScore}/100. Consider adding investments from different sectors.`,
      action: 'Add investments in underrepresented sectors like healthcare, utilities, or international markets.',
      impact: 'Reduces overall portfolio risk',
      icon: '🌍'
    });
  }

  // Risk balance recommendations
  const riskCounts = investments.reduce((counts, inv) => {
    counts[inv.riskLevel] = (counts[inv.riskLevel] || 0) + 1;
    return counts;
  }, {});

  if ((riskCounts.High || 0) > investments.length * 0.4) {
    recommendations.push({
      type: 'risk',
      priority: 'medium',
      title: 'Consider Reducing Risk Exposure',
      description: 'Your portfolio has high exposure to risky investments.',
      action: 'Consider adding some low-risk bonds or stable dividend stocks to balance your portfolio.',
      impact: 'Improves portfolio stability',
      icon: '⚖️'
    });
  }

  // Performance recommendations
  const underperformers = investments.filter(inv => inv.yearlyReturn < 3);
  if (underperformers.length > 0) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      title: 'Review Underperforming Investments',
      description: `${underperformers.length} investments are underperforming with returns below 3%.`,
      action: 'Review and consider replacing underperforming investments with better alternatives.',
      impact: 'Potentially improves overall returns',
      icon: '📊'
    });
  }

  // Opportunity recommendations
  if (metrics.totalValue > 50000 && !investments.some(inv => inv.type === 'REIT')) {
    recommendations.push({
      type: 'opportunity',
      priority: 'low',
      title: 'Consider Real Estate Investment',
      description: 'REITs can provide good diversification and income potential.',
      action: 'Consider adding a Real Estate Investment Trust (REIT) to your portfolio.',
      impact: 'Enhances diversification and potential income',
      icon: '🏢'
    });
  }

  return recommendations;
}

// Get user's investment portfolio
app.get('/api/investments', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // In a real app, you'd fetch from an investments table
    // For demo purposes, we'll generate realistic data
    let { data: existingInvestments, error: invError } = await supabaseClient
      .from('user_investments')
      .select('*')
      .eq('user_id', user_id);

    if (invError && invError.code !== 'PGRST116') throw invError;

    let investments = [];
    if (!existingInvestments || existingInvestments.length === 0) {
      // Generate initial investment data
      investments = generateInvestmentData(user_id);
      
      // Save to database (optional - for persistence)
      try {
        const { error: insertError } = await supabaseClient
          .from('user_investments')
          .insert(investments.map(inv => ({
            user_id,
            investment_id: inv.id,
            name: inv.name,
            type: inv.type,
            sector: inv.sector,
            current_value: inv.currentValue,
            purchase_value: inv.purchaseValue,
            daily_change: inv.dailyChange,
            monthly_return: inv.monthlyReturn,
            yearly_return: inv.yearlyReturn,
            risk_level: inv.riskLevel,
            purchase_date: inv.purchaseDate,
            last_updated: inv.lastUpdated
          })));

        if (insertError) console.error('Investment insert error:', insertError);
      } catch (err) {
        console.error('Investment save error:', err);
      }
    } else {
      // Use existing data
      investments = existingInvestments.map(inv => ({
        id: inv.investment_id,
        name: inv.name,
        type: inv.type,
        sector: inv.sector,
        currentValue: parseFloat(inv.current_value),
        purchaseValue: parseFloat(inv.purchase_value),
        dailyChange: parseFloat(inv.daily_change),
        monthlyReturn: parseFloat(inv.monthly_return),
        yearlyReturn: parseFloat(inv.yearly_return),
        riskLevel: inv.risk_level,
        purchaseDate: inv.purchase_date,
        lastUpdated: inv.last_updated
      }));
    }

    // Calculate portfolio metrics
    const metrics = calculatePortfolioMetrics(investments);

    // Generate recommendations
    const recommendations = generateInvestmentRecommendations(investments);

    res.json({
      investments,
      metrics,
      recommendations,
      summary: {
        totalValue: metrics.totalValue,
        totalGainLoss: metrics.totalGainLoss,
        totalReturnPercent: metrics.totalReturnPercent,
        dailyChange: metrics.dailyChange,
        dailyChangePercent: metrics.dailyChangePercent,
        riskLevel: metrics.overallRisk,
        diversificationScore: metrics.diversificationScore
      }
    });

  } catch (error) {
    console.error('Investments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch investment data' });
  }
});

// Get investment performance over time
app.get('/api/investments/performance', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { period = '1year', investmentId } = req.query;

  try {
    // Generate historical performance data
    const months = period === '1year' ? 12 : period === '6months' ? 6 : period === '3months' ? 3 : 1;
    const performance = [];

    for (let i = months; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Simulate portfolio value over time with some realistic volatility
      const baseValue = 70000 + Math.sin(i * 0.5) * 10000; // Trending upward with volatility
      const randomVariation = (Math.random() - 0.5) * 5000;
      const value = Math.round(baseValue + randomVariation);

      performance.push({
        date: date.toISOString().split('T')[0],
        value: value,
        change: i === months ? 0 : value - performance[performance.length - 1]?.value || 0
      });
    }

    res.json({ performance });

  } catch (error) {
    console.error('Investment performance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// Get investment analysis and insights
app.get('/api/investments/analysis', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // Get investment data
    const investmentsResponse = await fetch(`http://localhost:3001/api/investments`, {
      headers: { 'Authorization': req.headers.authorization }
    });
    const investmentData = await investmentsResponse.json();

    if (!investmentData.investments) {
      return res.status(404).json({ error: 'No investment data found' });
    }

    const investments = investmentData.investments;
    const metrics = investmentData.metrics;

    // Sector allocation
    const sectorAllocation = investments.reduce((allocation, inv) => {
      allocation[inv.sector] = (allocation[inv.sector] || 0) + inv.currentValue;
      return allocation;
    }, {});

    // Type allocation
    const typeAllocation = investments.reduce((allocation, inv) => {
      allocation[inv.type] = (allocation[inv.type] || 0) + inv.currentValue;
      return allocation;
    }, {});

    // Risk allocation
    const riskAllocation = investments.reduce((allocation, inv) => {
      allocation[inv.riskLevel] = (allocation[inv.riskLevel] || 0) + inv.currentValue;
      return allocation;
    }, {});

    // Performance analysis
    const winners = investments.filter(inv => inv.yearlyReturn > 0).length;
    const losers = investments.filter(inv => inv.yearlyReturn < 0).length;

    // Rebalancing suggestions
    const rebalancingSuggestions = [];
    const totalValue = metrics.totalValue;

        // Check if any sector is over-concentrated (>40% of portfolio)
    Object.entries(sectorAllocation).forEach(([sector, value]) => {
      const percentage = (value / totalValue) * 100;
      if (percentage > 40) {
        rebalancingSuggestions.push({
          type: 'reduce',
          sector,
          currentPercent: percentage.toFixed(1),
          suggestedPercent: '25-30',
          reason: 'Over-concentrated in single sector'
        });
      }
    });

    // Check for under-diversification
    if (Object.keys(sectorAllocation).length < 3) {
      rebalancingSuggestions.push({
        type: 'diversify',
        suggestion: 'Add investments in different sectors',
        reason: 'Portfolio lacks sector diversification'
      });
    }

    res.json({
      analysis: {
        sectorAllocation: Object.entries(sectorAllocation).map(([sector, value]) => ({
          sector,
          value,
          percentage: ((value / totalValue) * 100).toFixed(1)
        })),
        typeAllocation: Object.entries(typeAllocation).map(([type, value]) => ({
          type,
          value,
          percentage: ((value / totalValue) * 100).toFixed(1)
        })),
        riskAllocation: Object.entries(riskAllocation).map(([risk, value]) => ({
          risk,
          value,
          percentage: ((value / totalValue) * 100).toFixed(1)
        })),
        performance: {
          winners,
          losers,
          winRate: ((winners / investments.length) * 100).toFixed(1),
          bestPerformer: metrics.topPerformer,
          worstPerformer: metrics.worstPerformer
        },
        rebalancingSuggestions
      }
    });

  } catch (error) {
    console.error('Investment analysis error:', error);
    res.status(500).json({ error: 'Failed to generate investment analysis' });
  }
});

// Add new investment
app.post('/api/investments', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { name, type, sector, purchaseValue, riskLevel } = req.body;

  if (!name || !type || !purchaseValue) {
    return res.status(400).json({ error: 'Name, type, and purchase value are required' });
  }

  try {
    const investmentId = `inv_${user_id}_${Date.now()}`;
    const newInvestment = {
      id: investmentId,
      name,
      type,
      sector: sector || 'Diversified',
      currentValue: parseFloat(purchaseValue), // Start with purchase value
      purchaseValue: parseFloat(purchaseValue),
      dailyChange: 0,
      monthlyReturn: 0,
      yearlyReturn: 0,
      riskLevel: riskLevel || 'Medium',
      purchaseDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // Save to database
    const { error: insertError } = await supabaseClient
      .from('user_investments')
      .insert({
        user_id,
        investment_id: investmentId,
        name: newInvestment.name,
        type: newInvestment.type,
        sector: newInvestment.sector,
        current_value: newInvestment.currentValue,
        purchase_value: newInvestment.purchaseValue,
        daily_change: newInvestment.dailyChange,
        monthly_return: newInvestment.monthlyReturn,
        yearly_return: newInvestment.yearlyReturn,
        risk_level: newInvestment.riskLevel,
        purchase_date: newInvestment.purchaseDate,
        last_updated: newInvestment.lastUpdated
      });

    if (insertError) throw insertError;

    res.json({
      message: 'Investment added successfully',
      investment: newInvestment
    });

  } catch (error) {
    console.error('Add investment error:', error);
    res.status(500).json({ error: 'Failed to add investment' });
  }
});

// Update investment
app.put('/api/investments/:investmentId', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { investmentId } = req.params;
  const { currentValue, name, type, sector, riskLevel } = req.body;

  try {
    const updateData = {
      last_updated: new Date().toISOString()
    };

    if (currentValue !== undefined) updateData.current_value = parseFloat(currentValue);
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (sector !== undefined) updateData.sector = sector;
    if (riskLevel !== undefined) updateData.risk_level = riskLevel;

    const { data, error } = await supabaseClient
      .from('user_investments')
      .update(updateData)
      .eq('investment_id', investmentId)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({
      message: 'Investment updated successfully',
      investment: data
    });

  } catch (error) {
    console.error('Update investment error:', error);
    res.status(500).json({ error: 'Failed to update investment' });
  }
});

// Delete investment
app.delete('/api/investments/:investmentId', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { investmentId } = req.params;

  try {
    const { data, error } = await supabaseClient
      .from('user_investments')
      .delete()
      .eq('investment_id', investmentId)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({ message: 'Investment deleted successfully' });

  } catch (error) {
    console.error('Delete investment error:', error);
    res.status(500).json({ error: 'Failed to delete investment' });
  }
});

// Get investment market data (simulated)
app.get('/api/investments/market-data', authenticateToken, async (req, res) => {
  const { symbols } = req.query; // e.g., ?symbols=AAPL,GOOGL,MSFT

  try {
    // In a real app, you'd fetch from a financial data API
    // For demo, we'll simulate market data
    const symbolList = symbols ? symbols.split(',') : ['JSE', 'S&P500', 'FTSE', 'NASDAQ'];
    
    const marketData = symbolList.map(symbol => ({
      symbol,
      name: `${symbol} Index`,
      price: 1000 + Math.floor(Math.random() * 3000),
      change: (Math.random() - 0.5) * 100,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 1000000),
      lastUpdated: new Date().toISOString()
    }));

    res.json({ marketData });

  } catch (error) {
    console.error('Market data fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// Get investment research and news
app.get('/api/investments/research', authenticateToken, async (req, res) => {
  const { category = 'general' } = req.query;

  try {
    // Simulated research content
    const researchContent = {
      news: [
        {
          id: 1,
          title: 'Market Outlook: Strong Growth Expected in Tech Sector',
          summary: 'Analysts predict continued growth in technology investments...',
          category: 'Technology',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          source: 'Financial Times'
        },
        {
          id: 2,
          title: 'REITs Show Resilience Amid Market Volatility',
          summary: 'Real Estate Investment Trusts continue to provide stable returns...',
          category: 'Real Estate',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Investment Weekly'
        },
        {
          id: 3,
          title: 'Bond Market Analysis: Rising Interest Rates Impact',
          summary: 'Government bonds face challenges as interest rates climb...',
          category: 'Bonds',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Bond Trader'
        }
      ],
      insights: [
        {
          title: 'Diversification Strategy',
          content: 'A well-diversified portfolio should include investments across different sectors and asset classes.',
          type: 'strategy'
        },
        {
          title: 'Risk Management',
          content: 'Consider your risk tolerance when selecting investments. Higher returns often come with higher risks.',
          type: 'risk'
        },
        {
          title: 'Long-term Perspective',
          content: 'Investment success often requires patience. Consider your long-term financial goals.',
          type: 'advice'
        }
      ]
    };

    res.json(researchContent);

  } catch (error) {
    console.error('Research fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch research content' });
  }
});