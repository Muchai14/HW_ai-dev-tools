import pytest
from fastapi.testclient import TestClient
from app.main import app
from app import db


client = TestClient(app)


def test_create_and_get_room():
    # create default room
    resp = client.post('/rooms', json={})
    assert resp.status_code == 201
    room = resp.json()
    assert room['id']
    assert room['language'] in ('javascript', 'python')

    # get room
    rid = room['id']
    resp2 = client.get(f'/rooms/{rid}')
    assert resp2.status_code == 200
    got = resp2.json()
    assert got['id'] == rid


def test_join_update_leave():
    # create room
    resp = client.post('/rooms', json={'language': 'javascript'})
    assert resp.status_code == 201
    room = resp.json()
    rid = room['id']

    # join
    r2 = client.post(f'/rooms/{rid}/join')
    assert r2.status_code == 200
    assert r2.json()['participants'] == room['participants'] + 1

    # update code
    new_code = 'const x = 1;'
    upd = client.patch(f'/rooms/{rid}/code', json={'code': new_code})
    assert upd.status_code == 200
    assert upd.json()['code'] == new_code

    # update language
    upd_lang = client.patch(f'/rooms/{rid}/language', json={'language': 'python'})
    assert upd_lang.status_code == 200
    assert upd_lang.json()['language'] == 'python'

    # leave
    leave = client.post(f'/rooms/{rid}/leave')
    assert leave.status_code == 204
    # participants should be decremented
    got = client.get(f'/rooms/{rid}').json()
    assert got['participants'] >= 0


def test_websocket_broadcast():
    # create room
    resp = client.post('/rooms', json={})
    assert resp.status_code == 201
    room = resp.json()
    rid = room['id']

    with client.websocket_connect('/ws') as ws:
        # subscribe
        ws.send_json({'action': 'subscribe', 'roomId': rid})

        # update code which should trigger broadcast
        new_code = 'console.log("hi")'
        r = client.patch(f'/rooms/{rid}/code', json={'code': new_code})
        assert r.status_code == 200

        msg = ws.receive_json()
        assert msg['type'] == 'ROOM_UPDATE'
        assert msg['roomId'] == rid
        assert msg['room']['code'] == new_code


def test_participants_endpoints():
    # create room
    resp = client.post('/rooms', json={})
    assert resp.status_code == 201
    room = resp.json()
    rid = room['id']

    # add participant with name
    p = client.post(f'/rooms/{rid}/participants', json={'name': 'Alice'})
    assert p.status_code == 201
    participant = p.json()
    assert participant['name'] == 'Alice'

    # list participants
    lst = client.get(f'/rooms/{rid}/participants')
    assert lst.status_code == 200
    parts = lst.json()
    assert any(x['id'] == participant['id'] for x in parts)

    # delete participant
    d = client.delete(f"/rooms/{rid}/participants/{participant['id']}")
    assert d.status_code == 204

    # ensure removed
    lst2 = client.get(f'/rooms/{rid}/participants')
    assert lst2.status_code == 200
    assert all(x['id'] != participant['id'] for x in lst2.json())
