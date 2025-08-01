import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Event } from "../../types";
import {
  createImageErrorHandler,
  createImageLoadHandler,
} from "../../helpers/images/create-image-error-handler";
import { FALLBACK_EVENT_CARD_IMAGE } from "../../constants";

interface Props {
  event: Event;
  index: number;
}

export const EventCard = ({ event, index }: Props) => (
  <motion.div
    key={event.id}
    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Link to={`/events/${event.id}`} className="block">
      <div className="aspect-video relative overflow-hidden bg-gray-200 animate-pulse">
        <img
          src={event?.flyer_url}
          alt={event?.title}
          className="w-full h-full object-cover transition-opacity duration-300 opacity-0"
          onLoad={createImageLoadHandler()}
          onError={createImageErrorHandler({
            fallbackSrc: FALLBACK_EVENT_CARD_IMAGE,
          })}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center text-secondary">
          <Calendar className="w-5 h-5 mr-2" />
          <span>{new Date(event.date).toLocaleDateString()}</span>
        </div>
        <h3 className="text-xl font-bold text-primary">{event.title}</h3>
        {event.description && (
          <p className="text-secondary line-clamp-2">
            {event.description.replace(/<[^>]*>/g, "").substring(0, 100)}...
          </p>
        )}
        <div className="flex items-center text-primary hover:text-primary/80 transition-colors">
          <span>Create Your DP</span>
          <ArrowRight className="ml-2 w-4 h-4" />
        </div>
      </div>
    </Link>
  </motion.div>
);
