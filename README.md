# Orix Maclaren Hackathon

### System

![Screenshot](Docs/system_design.png)

![Screenshot](Docs/er_diagram_new.png)

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

### Run Frontend
Navigate to the frontend directory and follow these steps:

1. **Install dependencies**: ```npm i```
2. **Configure environment variables**: Create a `.env` file in the frontend directory and add the backend URL (e.g., `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`).
3. **Run in development mode** (starts the development server with hot reloading): ```npm start```
4. **Build for production** (creates an optimized build in the `dist` or `build` folder): ```npm run build```
5. **Run the production build** (serves the built application): ```npm run start```

### Test Data:
The test data is present in `ExternalSystemFolder` folder

## Presentation
PPT Link: https://www.canva.com/design/DAG9YyE3kBM/85kEQRKAuA_T51wwYlfdRQ/edit?utm_content=DAG9YyE3kBM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton
