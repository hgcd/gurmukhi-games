// Loading spinner functions
function showAllLoadingSpinners() {
    const chartIds = [
        'activityTypesPieChart',
        'activityCategoriesPieChart', 
        'userActivitiesBarChart',
        'usageStatsChart',
        'akharTimelineChart'
    ];
    
    chartIds.forEach(chartId => {
        const container = document.getElementById(chartId + '-container');
        const canvas = document.getElementById(chartId);
        if (container) container.classList.remove('d-none');
        if (canvas) canvas.classList.add('d-none');
    });
}

function hideLoadingSpinner(chartId) {
    const container = document.getElementById(chartId + '-container');
    const canvas = document.getElementById(chartId);
    if (container) container.classList.add('d-none');
    if (canvas) canvas.classList.remove('d-none');
}

function destroyAllCharts() {
    if (Chart.getChart("activityTypesPieChart")) {
        Chart.getChart("activityTypesPieChart").destroy();
    }
    if (Chart.getChart("activityCategoriesPieChart")) {
        Chart.getChart("activityCategoriesPieChart").destroy();
    }
    if (Chart.getChart("userActivitiesBarChart")) {
        Chart.getChart("userActivitiesBarChart").destroy();
    }
    if (Chart.getChart("usageStatsChart")) {
        Chart.getChart("usageStatsChart").destroy();
    }
    if (Chart.getChart("akharTimelineChart")) {
        Chart.getChart("akharTimelineChart").destroy();
    }
}

function updateFilterOptions(filterId, allValues, selectedValue) {
    $('#' + filterId).empty();
    $('#' + filterId).append('<option value="all">All</option>');
    for (let value of allValues) {
        let selected = value == selectedValue ? 'selected' : '';
        $('#' + filterId).append('<option value="' + value + '" ' + selected + '>' + value + '</option>');
    }
}

function updateAkharStats(akhar, totalCorrect, totalAttempts) {
    let akharAccuracy = document.getElementById(`akhar-accuracy-text-${akhar}`);
    let akharButton = document.getElementById(`akhar-${akhar}`);

    if (! akharAccuracy || ! akharButton) {
        return;
    }

    let accuracy = Math.round(totalCorrect / totalAttempts * 100, 2);

    // Set the text to the stats
    akharAccuracy.innerHTML = accuracy + "%" + "<br/>" + totalCorrect + "/" + totalAttempts;

    // Set the color of the text
    const redRange = [256, 160];
    const greenRange = [160, 256];
    const blueRange = [160, 160];

    let passAccuracy = 50;

    let red = Math.floor(redRange[0] + (redRange[1] - redRange[0]) * (accuracy - passAccuracy) / (100 - passAccuracy));
    let green = Math.floor(greenRange[0] + (greenRange[1] - greenRange[0]) * (accuracy - passAccuracy) / (100 - passAccuracy));
    let blue = Math.floor(blueRange[0] + (blueRange[1] - blueRange[0]) * (accuracy - passAccuracy) / (100 - passAccuracy));
    let alpha = Math.min(totalAttempts, 10) / 10;

    // Set the background color of the button
    akharButton.style.backgroundColor = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function clearAkharStatsGrid() {
    for (let akhar of ["ੳ", "ਅ", "ੲ", "ਸ", "ਹ", "ਕ", "ਖ", "ਗ", "ਘ", "ਙ", "ਚ", "ਛ", "ਜ", "ਝ", "ਞ", "ਟ", "ਠ", "ਡ", "ਢ", "ਣ", "ਤ", "ਥ", "ਦ", "ਧ", "ਨ", "ਪ", "ਫ", "ਬ", "ਭ", "ਮ", "ਯ", "ਰ", "ਲ", "ਵ", "ੜ", "ਸ਼", "ਜ਼", "ਫ਼", "ਖ਼", "ਗ਼", "ਲ਼"]) {
        let akharBtn = document.getElementById("akhar-" + akhar);
        if (! akharBtn) {
            continue;
        }

        // Update score
        document.getElementById("akhar-accuracy-text-" + akhar).innerHTML = "-<br/>0/0";

        // Clear color
        akharBtn.style.backgroundColor = "rgba(0, 0, 0, 0)";

        // Update onclick
        akharBtn.onclick = null;
    }
}

function displayAnalytics(stats) {
    // Hide error message
    document.getElementById('error-message').classList.add('d-none');

    if (stats.activity_stats == null || stats.akhar_stats == null || stats.usage_stats == null) {
        console.log("Activity is null", stats.activity_stats == null);
        console.log("Akhar is null", stats.akhar_stats == null);
        console.log("Usage is null", stats.usage_stats == null);

        // Show error message
        document.getElementById('error-message').innerHTML = "No data found";
        document.getElementById('error-message').classList.remove('d-none');

        // Hide loading spinners
        hideLoadingSpinner('activityTypesPieChart');
        hideLoadingSpinner('activityCategoriesPieChart');
        hideLoadingSpinner('userActivitiesBarChart');
        hideLoadingSpinner('usageStatsChart');
        hideLoadingSpinner('akharTimelineChart');
        return;
    }
    
    // Update filter options
    updateFilterOptions('game-filter-select', stats.all_games, stats.selected_game);
    updateFilterOptions('category-filter-select', stats.all_categories, stats.selected_category);
    updateFilterOptions('student-filter-select', stats.all_user_ids, stats.selected_user_id);
    
    // Update activity types pie chart
    updateActivityTypesPieChart(
        stats.activity_stats.activity_type_counts
    );
    
    // Update activity categories pie chart
    updateActivityCategoriesPieChart(
        stats.activity_stats.activity_categories_counts
    );

    // Update user activities and points combined chart
    updateUserActivitiesAndPointsChart(
        stats.activity_stats.user_activities_counts,
        stats.activity_stats.user_points_stats
    );

    // Update usage stats chart
    updateUsageStatsChart(
        stats.usage_stats.activity_counts
    );

    // Clear akhar stats grid
    clearAkharStatsGrid();

    // Update from akhar stats
    for (let akhar of Object.keys(stats.akhar_stats.akhar_stats)) {
        updateAkharStats(
            akhar,
            stats.akhar_stats.akhar_stats[akhar]['total_correct'],
            stats.akhar_stats.akhar_stats[akhar]['total_attempts']
        );

        // Set button onclick to update timeline
        let akharBtn = document.getElementById("akhar-" + akhar);
        if (! akharBtn) {
            continue;
        }

        akharBtn.onclick = function() {
            updateAkharTimeline(
                akhar,
                stats.akhar_stats.akhar_stats[akhar]["attempt_timeline"]
            );
        }
    }

    // Set total timeline
    updateAkharTimeline(
        null,
        stats.akhar_stats.all_attempt_timeline
    );
}

//// Chart functions ////
Chart.defaults.font.size = 16;
function updateAkharTimeline(akhar, timeline) {
    // Destroy existing chart if it exists
    let existingChart = Chart.getChart("akharTimelineChart");
    if (existingChart) {
        existingChart.destroy();
    }

    // Format dates and prepare data
    const dates = timeline.map(item => {
        let date = new Date(item.date);
        return date.toLocaleDateString();
    });
    
    const correctData = timeline.map(item => item.num_correct);
    const mistakeData = timeline.map(item => item.num_mistakes);

    // Create new chart
    const ctx = document.getElementById('akharTimelineChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Correct',
                    data: correctData,
                    backgroundColor: 'rgba(75, 192, 75, 0.8)',
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Incorrect',
                    data: mistakeData,
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: ''
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '# Attempts',
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: akhar || '',
                    font: {
                        size: 28
                    }
                }
            }
        }
    });
    
    // Hide loading spinner
    hideLoadingSpinner('akharTimelineChart');
}

function updateActivityTypesPieChart(data) {
    // Destroy existing chart if it exists
    let existingChart = Chart.getChart("activityTypesPieChart");
    if (existingChart) {
        existingChart.destroy();
    }

    let types = Object.keys(data);
    let counts = Object.values(data);

    // Create arrays of objects for sorting
    const dataForSorting = types.map((type, index) => ({
        type: type,
        count: counts[index]
    }));

    // Sort by count in descending order
    dataForSorting.sort((a, b) => b.count - a.count);

    // Extract sorted data
    const sortedTypes = dataForSorting.map(item => item.type);
    const sortedCounts = dataForSorting.map(item => item.count);

    // Create new chart
    const ctx = document.getElementById('activityTypesPieChart');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: sortedTypes,
            datasets: [{
                data: sortedCounts,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth: 1,
            }]
        }
    });
    
    // Hide loading spinner
    hideLoadingSpinner('activityTypesPieChart');
}

function updateActivityCategoriesPieChart(data) {
    // Destroy existing chart if it exists
    let existingChart = Chart.getChart("activityCategoriesPieChart");
    if (existingChart) {
        existingChart.destroy();
    }

    let categories = Object.keys(data);
    let counts = Object.values(data);

    // Create arrays of objects for sorting
    const dataForSorting = categories.map((category, index) => ({
        category: category,
        count: counts[index]
    }));

    // Sort by count in descending order
    dataForSorting.sort((a, b) => b.count - a.count);

    // Extract sorted data
    const sortedCategories = dataForSorting.map(item => item.category);
    const sortedCounts = dataForSorting.map(item => item.count);

    // Create new chart
    const ctx = document.getElementById('activityCategoriesPieChart');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: sortedCategories,
            datasets: [{
                data: sortedCounts,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth: 1,
            }]
        }
    });
    
    // Hide loading spinner
    hideLoadingSpinner('activityCategoriesPieChart');
}

function updateUserActivitiesAndPointsChart(activitiesData, pointsData) {
    // Destroy existing chart if it exists
    let existingChart = Chart.getChart("userActivitiesBarChart");
    if (existingChart) {
        existingChart.destroy();
    }

    let users = Object.keys(activitiesData);
    let activities = Object.values(activitiesData);
    let points = Object.values(pointsData);

    // Create arrays of objects for sorting
    const dataForSorting = users.map((user, index) => ({
        user: user,
        activities: activities[index],
        points: points[index]
    }));

    // Sort by activities in descending order
    dataForSorting.sort((a, b) => b.activities - a.activities);

    // Extract sorted data
    const sortedUsers = dataForSorting.map(item => item.user);
    const sortedActivities = dataForSorting.map(item => item.activities);
    const sortedPoints = dataForSorting.map(item => item.points);

    // Find the maximum values to normalize data
    const maxActivities = Math.max(...sortedActivities);
    const minActivities = Math.min(...sortedActivities);
    const maxPoints = Math.max(...sortedPoints);
    const minPoints = Math.min(...sortedPoints);

    // Use original data without normalization
    const normalizedActivities = sortedActivities;
    const normalizedPoints = sortedPoints;

    // Create new chart
    const ctx = document.getElementById('userActivitiesBarChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedUsers,
            datasets: [
                {
                    label: 'Activities',
                    data: normalizedActivities,
                    borderColor: "rgb(0, 0, 0, 1)",
                    borderWidth: 1,
                    backgroundColor: "rgba(147, 112, 219, 0.8)", // Purple
                    yAxisID: 'y'
                },
                {
                    label: 'Score',
                    data: normalizedPoints,
                    borderColor: "rgb(0, 0, 0, 1)",
                    borderWidth: 1,
                    backgroundColor: "rgba(64, 224, 208, 0.8)", // Turquoise
                    yAxisID: 'y1'
                }
            ],
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const originalValue = context.dataset.label === 'Activities' 
                                ? sortedActivities[context.dataIndex] 
                                : sortedPoints[context.dataIndex];
                            return label + ': ' + originalValue;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Activities'
                    },
                    max: maxActivities,
                    min: minPoints < 0 ? maxActivities * minPoints / maxPoints : 0,
                    beginAtZero: true,
                    ticks: {
                        callback: function(value, index, values) {
                            // Display original values
                            return Math.round(value);
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Score'
                    },
                    max: maxPoints,
                    min: minPoints < 0 ? minPoints : 0,
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        callback: function(value, index, values) {
                            // Display original values
                            return Math.round(value);
                        }
                    }
                }
            }
        }
    });
    
    // Hide loading spinner
    hideLoadingSpinner('userActivitiesBarChart');
}

function updateUsageStatsChart(data) {
    // Destroy existing chart if it exists
    let existingChart = Chart.getChart("usageStatsChart");
    if (existingChart) {
        existingChart.destroy();
    }

    // Create line chart
    const dates = Object.keys(data);
    const counts = Object.values(data);

    const ctx = document.getElementById('usageStatsChart');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Activities',
                data: counts,
                borderColor: 'rgb(0, 63, 63)',
                backgroundColor: 'rgba(41, 156, 182, 0.38)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            scales: {
                x: {},
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '# Activities'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Hide loading spinner
    hideLoadingSpinner('usageStatsChart');
}