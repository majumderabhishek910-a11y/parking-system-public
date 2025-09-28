"""
🌐 Cloud-Ready Parking System - Always Running
This is the main application file for cloud deployment.
"""

import os
import json
from flask import Flask, render_template, jsonify, request
import time
import random

app = Flask(__name__, template_folder='templates', static_folder='static')

# --- Data Simulation ---
def generate_street_parking_data(lat, lng):
    """Generate realistic street parking data"""
    parking_spots = []
    base_lat, base_lng = lat, lng
    
    for i in range(8):
        offset_lat = (i % 4 - 1.5) * 0.001
        offset_lng = (i // 4 - 0.5) * 0.001
        
        spot_lat = base_lat + offset_lat
        spot_lng = base_lng + offset_lng
        
        is_available = random.random() > 0.3
        
        parking_spots.append({
            'id': f'street_{i+1}',
            'name': f'Street Parking Spot {i+1}',
            'lat': spot_lat,
            'lng': spot_lng,
            'available': is_available,
            'price_per_hour': round(random.uniform(20, 50), 2),
            'distance': round(random.uniform(50, 300), 1),
            'type': 'Street Parking'
        })
    
    return parking_spots

def generate_traffic_junctions(lat, lng):
    """Generate traffic junction data"""
    junctions = []
    base_lat, base_lng = lat, lng
    
    for i in range(5):
        offset_lat = (i % 3 - 1) * 0.002
        offset_lng = (i // 3 - 0.5) * 0.002
        
        junction_lat = base_lat + offset_lat
        junction_lng = base_lng + offset_lng
        
        traffic_level = random.choice(['Low', 'Medium', 'High'])
        signal_timing = random.randint(30, 120)
        
        junctions.append({
            'id': f'junction_{i+1}',
            'name': f'Traffic Junction {i+1}',
            'lat': junction_lat,
            'lng': junction_lng,
            'traffic_level': traffic_level,
            'signal_timing': signal_timing,
            'wait_time': random.randint(10, 60)
        })
    
    return junctions

def generate_ai_suggestions(lat, lng):
    """Generate AI-powered parking suggestions"""
    suggestions = []
    
    time_of_day = time.strftime('%H')
    hour = int(time_of_day)
    
    if 8 <= hour <= 10 or 17 <= hour <= 19:
        peak_hours = True
    else:
        peak_hours = False
    
    suggestions.append({
        'type': 'Parking Strategy',
        'message': 'Peak hours detected. Consider alternative parking locations.',
        'confidence': 0.85,
        'priority': 'High' if peak_hours else 'Medium'
    })
    
    suggestions.append({
        'type': 'Traffic Optimization',
        'message': 'AI suggests taking Route A to avoid congestion.',
        'confidence': 0.78,
        'priority': 'Medium'
    })
    
    suggestions.append({
        'type': 'Cost Optimization',
        'message': 'Street parking is 40% cheaper than nearby garages.',
        'confidence': 0.92,
        'priority': 'High'
    })
    
    return suggestions

def generate_ai_traffic_signals(lat, lng):
    """Generate AI-powered traffic signal data"""
    signals = []
    base_lat, base_lng = lat, lng
    
    for i in range(3):
        offset_lat = (i - 1) * 0.0015
        offset_lng = 0
        
        signal_lat = base_lat + offset_lat
        signal_lng = base_lng + offset_lng
        
        base_timing = 60
        ai_adjustment = random.randint(-15, 20)
        optimized_timing = max(30, base_timing + ai_adjustment)
        
        signals.append({
            'id': f'signal_{i+1}',
            'name': f'AI Traffic Signal {i+1}',
            'lat': signal_lat,
            'lng': signal_lng,
            'current_phase': random.choice(['Red', 'Yellow', 'Green']),
            'timing': optimized_timing,
            'ai_optimized': True,
            'efficiency': round(random.uniform(75, 95), 1)
        })
    
    return signals

# --- Flask Routes ---
@app.route('/')
def dashboard():
    return render_template('simple_demo.html')

@app.route('/api/street-parking')
def get_street_parking():
    lat = float(request.args.get('lat', 20.2961))
    lng = float(request.args.get('lng', 85.8245))
    
    parking_data = generate_street_parking_data(lat, lng)
    
    return jsonify({
        'success': True,
        'data': parking_data,
        'timestamp': time.time(),
        'location': {'lat': lat, 'lng': lng}
    })

@app.route('/api/traffic-junctions')
def get_traffic_junctions():
    lat = float(request.args.get('lat', 20.2961))
    lng = float(request.args.get('lng', 85.8245))
    
    junctions = generate_traffic_junctions(lat, lng)
    
    return jsonify({
        'success': True,
        'data': junctions,
        'timestamp': time.time(),
        'location': {'lat': lat, 'lng': lng}
    })

@app.route('/api/ai-suggestions')
def get_ai_suggestions():
    lat = float(request.args.get('lat', 20.2961))
    lng = float(request.args.get('lng', 85.8245))
    
    suggestions = generate_ai_suggestions(lat, lng)
    
    return jsonify({
        'success': True,
        'data': suggestions,
        'timestamp': time.time(),
        'location': {'lat': lat, 'lng': lng}
    })

@app.route('/api/ai-traffic-signals')
def get_ai_traffic_signals():
    lat = float(request.args.get('lat', 20.2961))
    lng = float(request.args.get('lng', 85.8245))
    
    signals = generate_ai_traffic_signals(lat, lng)
    
    return jsonify({
        'success': True,
        'data': signals,
        'timestamp': time.time(),
        'location': {'lat': lat, 'lng': lng}
    })

@app.route('/health')
def health_check():
    """Health check endpoint for cloud platforms"""
    return jsonify({
        'status': 'healthy',
        'timestamp': time.time(),
        'service': 'Parking AI System - Cloud Deployed',
        'version': '1.0.0'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("🚀 Starting Cloud-Ready Parking System...")
    print(f"🌐 Web interface will be available at: http://0.0.0.0:{port}")
    print("📱 Mobile-friendly interface with real-time updates")
    print("🌍 Server is ready for cloud deployment!")
    print("🔧 No configuration needed - works automatically!")
    print("\n⏳ Starting server...")
    app.run(debug=False, host='0.0.0.0', port=port, threaded=True)
