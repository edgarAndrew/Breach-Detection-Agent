# Orix Maclaren Hackathon

### Setup Agent

#### Create virtual env
```
python -m venv venv
```

#### Activate virtual env
- Windows powershell
```
.\venv\Scripts\activate.ps1
```
- Bash
```
.\venv\Scripts\activate
```

#### Install dependencies
```
pip install -r requirements.txt
```

#### Environment variables
- Refer to .env.example placeholder and create a .env file at the same level

#### Start application
```
python run.py
```

### Run External System (Demo)
```
cd ExternalSystem
python external_system_simulator.py
```