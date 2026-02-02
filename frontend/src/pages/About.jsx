import React from 'react'

export default function About(){
  return (
    <div className="page-full">
      <div className="constrain">
        <h2>About Bridge Quality Index (BQI)</h2>

      <div className="card-grid" style={{display:'flex',flexDirection:'column',gap:18}}>
        <div className="card" style={{padding:24,fontSize:16,lineHeight:1.5}}>
          <h3>Problem Statements</h3>
          <p>Many bridges lack continuous monitoring. Inspections are infrequent and subjective, making it difficult to prioritise maintenance and identify at-risk structures early.</p>
          <ul>
            <li>Lack of continuous bridge health monitoring</li>
            <li>Difficulty identifying high-risk bridges early</li>
            <li>Manual inspection delays and subjectivity</li>
          </ul>
        </div>

        <div className="card" style={{padding:24,fontSize:16,lineHeight:1.5}}>
          <h3>Solutions</h3>
          <p>BQI combines sensor data and inspection inputs into a single, easy-to-interpret score to guide maintenance decisions and public reporting.</p>
          <ul>
            <li>BQI provides a digital platform to evaluate bridge safety</li>
            <li>Weighted analysis of strain, vibration, and temperature</li>
            <li>Role-based dashboards for monitoring and reporting</li>
          </ul>
        </div>

        <div className="card" style={{padding:24,fontSize:16,lineHeight:1.6}}>
          <h3>Formula</h3>
          <p>
            BQI is calculated as a weighted combination of normalized sub-scores (Strain, Vibration, Temperature) and scaled to 0–100.
            The formula used in this system is:
          </p>
          <p style={{fontWeight:700,marginTop:8}}>
            BQI = 100 × [0.45 × (1 − S_norm) + 0.40 × (1 − V_norm) + 0.15 × (1 − T_norm)]
          </p>
          <p style={{marginTop:8}}>
            Explanation: S_norm, V_norm and T_norm are the normalized sub-scores for Strain, Vibration and Temperature respectively (each normalized to a 0–1 range where higher values indicate better condition). The terms (1 − S_norm) etc. convert the normalized condition into a contribution reflecting health degradation. Weights (0.45, 0.40, 0.15) reflect the relative importance of each sensor input. The result is multiplied by 100 to produce a percentage-style BQI (0 = poorest, 100 = best).
          </p>
        </div>

        <div className="card" style={{padding:24,fontSize:16,lineHeight:1.5}}>
          <h3>Future Scope</h3>
          <p>We plan to expand BQI with richer sensor types, machine-learning prediction, and tighter integration with government GIS platforms for unified asset management.</p>
          <ul>
            <li>IoT sensor integration</li>
            <li>AI-based predictive maintenance</li>
            <li>Government GIS integration</li>
          </ul>
        </div>
      </div>
      </div>
    </div>
  )
}
