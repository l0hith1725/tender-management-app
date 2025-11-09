import React from 'react'
import { useQuery } from 'react-query'
import api from '../../services/api'
import { Link } from 'react-router-dom'

export default function AssignmentsPage(){
  const { data, isLoading } = useQuery(['evaluator','assignments'], async ()=>{
    const res = await api.get('/evaluations/my-assignments')
    return res.data.assignments
  })

  if (isLoading) return <div>Loading…</div>
  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">My Assignments</h2>
      <table className="w-full table-auto">
        <thead>
          <tr className="text-left"><th>Tender</th><th>Bidder</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          {data?.map(a => (
            <tr key={a.Review_ID} className="border-t">
              <td>{a.Tender_Title}</td>
              <td>{a.Company_Name}</td>
              <td>{a.Review_Status}</td>
              <td><Link to={`/evaluator/reviews/${a.Review_ID}`} className="text-blue-600">Review</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
