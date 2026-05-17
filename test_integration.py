"""
Integration Test Script for RepoGraph AI
Tests all API endpoints and frontend integration points
"""

import requests
import json
import os
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the root health check endpoint"""
    print("\n🔍 Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "RepoGraph AI API"
        assert data["ai_provider"] == "IBM Bob"
        print("✅ Health check passed")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_repo_scan():
    """Test repository scanning endpoint"""
    print("\n🔍 Testing Repository Scan...")
    try:
        # Use the backend directory as test repo
        test_path = str(Path(__file__).parent / "backend")
        
        response = requests.post(
            f"{BASE_URL}/api/repo/scan",
            json={"repo_path": test_path}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Repository scan passed")
            print(f"   - Status: {data.get('status')}")
            print(f"   - Files found: {data.get('summary', {}).get('total_files', 0)}")
            return True
        else:
            print(f"❌ Repository scan failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Repository scan failed: {e}")
        return False

def test_get_graph():
    """Test getting graph data"""
    print("\n🔍 Testing Get Graph...")
    try:
        response = requests.get(f"{BASE_URL}/api/repo/graph")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Get graph passed")
            print(f"   - Nodes: {len(data.get('nodes', []))}")
            print(f"   - Edges: {len(data.get('edges', []))}")
            return data
        else:
            print(f"❌ Get graph failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Get graph failed: {e}")
        return None

def test_get_node(node_id):
    """Test getting node details"""
    print(f"\n🔍 Testing Get Node: {node_id}...")
    try:
        response = requests.get(f"{BASE_URL}/api/node/{node_id}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Get node passed")
            print(f"   - Node: {data.get('node', {}).get('name')}")
            print(f"   - Type: {data.get('node', {}).get('type')}")
            print(f"   - Incoming edges: {data.get('dependency_count', {}).get('incoming', 0)}")
            print(f"   - Outgoing edges: {data.get('dependency_count', {}).get('outgoing', 0)}")
            return True
        else:
            print(f"❌ Get node failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get node failed: {e}")
        return False

def test_dashboard_summary():
    """Test dashboard summary endpoint"""
    print("\n🔍 Testing Dashboard Summary...")
    try:
        response = requests.get(f"{BASE_URL}/api/dashboard/summary")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Dashboard summary passed")
            metadata = data.get('metadata', {})
            print(f"   - Total files: {metadata.get('total_files', 0)}")
            print(f"   - Total classes: {metadata.get('total_classes', 0)}")
            print(f"   - Total functions: {metadata.get('total_functions', 0)}")
            print(f"   - Hotspots: {len(data.get('hotspots', []))}")
            return True
        else:
            print(f"❌ Dashboard summary failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Dashboard summary failed: {e}")
        return False

def test_ai_endpoints(node_id):
    """Test IBM Bob AI endpoints"""
    print(f"\n🔍 Testing AI Endpoints for node: {node_id}...")
    
    endpoints = [
        ("explain", "Explain"),
        ("analyze", "Analyze"),
        ("modernize", "Modernize"),
        ("tests", "Generate Tests"),
        ("docs", "Generate Docs")
    ]
    
    results = []
    for endpoint, name in endpoints:
        try:
            print(f"\n   Testing {name}...")
            response = requests.post(f"{BASE_URL}/api/node/{node_id}/{endpoint}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ {name} passed")
                print(f"      - AI Provider: {data.get('ai_provider', 'N/A')}")
                print(f"      - Confidence: {data.get('confidence', 'N/A')}")
                results.append(True)
            else:
                print(f"   ❌ {name} failed: {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f"   ❌ {name} failed: {e}")
            results.append(False)
    
    return all(results)

def test_cors():
    """Test CORS headers"""
    print("\n🔍 Testing CORS Configuration...")
    try:
        response = requests.options(
            f"{BASE_URL}/api/repo/graph",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET"
            }
        )
        
        if response.status_code in [200, 204]:
            print("✅ CORS configuration passed")
            return True
        else:
            print(f"❌ CORS configuration failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ CORS test failed: {e}")
        return False

def run_all_tests():
    """Run all integration tests"""
    print("=" * 60)
    print("🚀 RepoGraph AI - Integration Test Suite")
    print("=" * 60)
    
    results = {}
    
    # Test 1: Health Check
    results["health_check"] = test_health_check()
    
    # Test 2: CORS
    results["cors"] = test_cors()
    
    # Test 3: Repository Scan
    results["repo_scan"] = test_repo_scan()
    
    # Test 4: Get Graph
    graph_data = test_get_graph()
    results["get_graph"] = graph_data is not None
    
    # Test 5: Dashboard Summary
    results["dashboard"] = test_dashboard_summary()
    
    # Test 6: Get Node (if we have nodes)
    if graph_data and graph_data.get('nodes'):
        first_node = graph_data['nodes'][0]
        node_id = first_node.get('id')
        results["get_node"] = test_get_node(node_id)
        
        # Test 7: AI Endpoints
        results["ai_endpoints"] = test_ai_endpoints(node_id)
    else:
        print("\n⚠️  Skipping node and AI tests (no nodes available)")
        results["get_node"] = None
        results["ai_endpoints"] = None
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v is True)
    failed = sum(1 for v in results.values() if v is False)
    skipped = sum(1 for v in results.values() if v is None)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result is True else "❌ FAIL" if result is False else "⏭️  SKIP"
        print(f"{status} - {test_name}")
    
    print("\n" + "=" * 60)
    print(f"Total: {total} | Passed: {passed} | Failed: {failed} | Skipped: {skipped}")
    
    if failed == 0:
        print("🎉 All tests passed!")
    else:
        print(f"⚠️  {failed} test(s) failed")
    
    print("=" * 60)
    
    return failed == 0

if __name__ == "__main__":
    try:
        success = run_all_tests()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n\n❌ Test suite failed with error: {e}")
        exit(1)

# Made with Bob
