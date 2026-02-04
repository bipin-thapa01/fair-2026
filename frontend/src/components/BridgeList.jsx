import React from 'react'
import { classification } from '../utils/bqi'

export default function BridgeList({bridges, onEdit, onDelete}){
  return (
    <div className="bridge-list">
      <table>
        <thead>
          <tr><th>Name</th><th>BQI</th><th>Risk</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {bridges.map(b=>{
            const cls = classification(b.bqi ?? 0)
            return (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.bqi ?? '—'}</td>
                <td><span style={{color:cls.color}}>{cls.label}</span></td>
                <td>
                  <button onClick={()=>onEdit(b)}>Edit</button>
                  <button onClick={()=>onDelete(b.id)}>Delete</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
