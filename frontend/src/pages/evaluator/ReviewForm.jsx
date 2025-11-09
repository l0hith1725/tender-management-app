import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../services/api'

export default function ReviewForm(){
  const { reviewId } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm()

  const onSubmit = async (data) => {
    try{
      await api.post(`/evaluations/review/${reviewId}`, { technicalMarks: Number(data.technical), financialMarks: Number(data.financial), comments: data.comments })
      alert('Review submitted')
      navigate('/evaluator/assignments')
    }catch(err){
      alert(err.message || err)
    }
  }

  return (
    <div className="p-4 max-w-lg">
      <h2 className="text-2xl mb-4">Submit Review</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <label className="block">Technical Marks (0-100)</label>
        <input {...register('technical')} type="number" min="0" max="100" className="w-full p-2 border rounded" />
        <label className="block">Financial Marks (0-100)</label>
        <input {...register('financial')} type="number" min="0" max="100" className="w-full p-2 border rounded" />
        <label className="block">Comments</label>
        <textarea {...register('comments')} className="w-full p-2 border rounded" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
      </form>
    </div>
  )
}
